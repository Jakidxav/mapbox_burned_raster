import json
import numpy as np
import timeit

import shapely
import geopandas as gpd
import xarray as xr
import rioxarray
from geocube.api.core import make_geocube

import matplotlib
from matplotlib import cm


def load_tavg_data():
    tavg_path = "../../data/wc2.1_10m_tavg_01.tif"
    var = "tavg"
    ds = xr.open_dataset(tavg_path, default_name=var).drop('band')
    
    return ds[var]


def load_precip_data():
    precip_path = "../../data/wc2.1_10m_prec_01.tif"
    var = "precip"
    ds = xr.open_dataset(precip_path, default_name=var).drop('band')
    
    return ds[var]


def raster_burn(vector_grid, data, load_data=True, skipna=True, clip=False, interp=None):
    """
    Burn raster data onto a vector grid.

    This method seems to only work when there are no gaps in the numbering
    of the index in vector_grid.
    """
    
    start = timeit.default_timer()
    #---------------------------------------------------------------------------

    if clip:
        # Clip to the external bounds of the input geometry
        # minx, miny, maxx, maxy = vector_grid.total_bounds
        # data = data.sel(x=slice(minx, maxx), y=slice(miny, maxy))

        # in our case, the geometry is the whole world, either land or ocean grid
        min_x, max_x = data.x.min().values, data.x.max().values
        min_y, max_y = data.y.min().values, data.y.max().values
        
        top_left = (min_x, max_y)
        top_right = (max_x, max_y)
        bottom_left = (min_x, min_y)
        bottom_right = (max_x, min_y)
        
        bbox_geom = shapely.Polygon([top_left, top_right, bottom_right, bottom_left])
        bbox = gpd.GeoDataFrame(geometry=[bbox_geom], crs=land_grid.crs)
        
        vector_grid = vector_grid.clip(bbox)
    
    # Interpolate to a finer grid first
    # if interp is not None and interp > 1:
    #     new_x  = np.linspace( data.x[0], data.x[-1], int(len(data.x) * interp) )
    #     new_y  = np.linspace( data.y[0], data.y[-1], int(len(data.y) * interp) )
    #     data = data.interp( x = new_x, y = new_y, method='nearest' )
    
    # Load data to disk before analysis (much quicker).
    if load_data:
        data = data.load()
    
    # Burn polygon indices ('index' in dataframe ) onto same raster as data
    burned = make_geocube( vector_data = vector_grid,
                           measurements = ["polygon_id"],
                           like = data )
    
    # Get indices of rasters that successfully burned (some will have been too small)
    success_idx = np.array([int(success) for success in np.unique( burned.polygon_id ).tolist() if np.isnan(success) == False])
    success_idx = success_idx[ success_idx >= 0 ]

    # Group together the raster data by polygon index
    data['polygon_id'] = (['y','x'], burned.polygon_id.values )
    polygon_groups = data.groupby('polygon_id')

    # Get statistics for burned raster analysis
    gdf_stats = vector_grid.copy()
    gdf_stats[data.name + "_value"] = np.nan
    gdf_stats[data.name + "_value"].loc[success_idx] = polygon_groups.mean( skipna = skipna ).values.squeeze()

    # For missing rows (polygon too small) interpolate to centroids
    missing_idx = np.array( [ ii for ii in vector_grid.polygon_id.values if ii not in success_idx ] )
    print("Number of missing polygons: ")
    print(len(missing_idx))
    
    #---------------------------------------------------------------------------
    end = timeit.default_timer()
    print(f"Time to complete: {(end - start):.5f}s")

    gdf_stats.drop('polygon_id', axis=1, inplace=True)
    gdf_stats = gdf_stats[['id', data.name + '_value', 'geometry']]
    
    return gdf_stats


def rgba2hex(value, normalizer, colormap):
    rgba = np.array(colormap(normalizer(value), bytes=True))
    hex = cm.colors.to_hex(rgba / 255.)
    
    return hex

