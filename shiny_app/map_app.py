from PIL import Image
import numpy as np
import pandas as pd
import geopandas as gpd
import rioxarray

import matplotlib
from matplotlib import cm
import matplotlib.pyplot as plt
#import seaborn as sns
import plotly
import plotly.graph_objects as go
from plotly.subplots import make_subplots
import plotly.express as px

from shiny import App, ui, render, reactive
from shinywidgets import output_widget, render_widget

# shiny run --reload map_app.py

# start app ui code here
app_ui = ui.page_bootstrap(
    ui.tags.head(
        ui.include_js("mapbox-gl.js", method="inline"),
        #ui.include_js("stats_with_colors.js", method="inline"), # lower-resolution version
        ui.include_js("stats_with_colors_highres.js", method="inline"),
        ui.include_css("mapbox-gl.css", method="inline"),
        ui.include_css("stylesheet.css"),
    ),
    ui.panel_title("Burning raster data onto vectors and displaying them on a 3D Mapbox globe"),
    
    ui.layout_sidebar(
        ui.panel_sidebar(
             width=2,
        ),
        ui.panel_main(
            ui.navset_tab(
                ui.nav("3D - interactive web map", 
                       ui.div({"id": "map"}),
                       # https://shiny.posit.co/py/api/ui.tags.html#shiny.ui.tags.script
                       #ui.tags.script(""" """),
                       ui.include_js("load_map.js", method="inline"),
                )
            ),
        ),
    )
)

def server(input, output, session):
    ...

app = App(app_ui, server)