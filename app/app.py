from shiny import App, ui, render, reactive
from shinywidgets import output_widget, render_widget

# shiny run --reload map_app.py

# start app ui code here
app_ui = ui.page_bootstrap(
    ui.tags.head(
        ui.include_js("mapbox-gl.js", method="inline"),
        ui.include_js("../data/raster_grid_gadm.js", method="inline"),
        # ui.include_js("../data/raster_grid_ne.js", method="inline"),
        ui.include_js("../data/ocean_mask.js", method="inline"),
        ui.include_js("../data/lakes_50m.js", method="inline"),

        # ui.include_js("../data/countries.js", method="inline"),
        # ui.include_js("../data/states.js", method="inline"),
        ui.include_css("mapbox-gl.css", method="inline"),
        ui.include_css("stylesheet.css"),
    ),
    ui.panel_title("Burning raster data onto vectors, displaying them on a Mapbox globe"),
    
    ui.layout_sidebar(
        ui.panel_sidebar(
            ui.input_select("variable_selector", "", ["Tavg", "Precip",]),
            ui.div({"id": "display_text_container"}, 
                   ui.p({"id": "display_text"}, "Hover over a location to print the GID code and mean value.")
                   ),
            ui.div({"class": "toggle_container"}, 
                #    ui.input_switch("toggle_land_mask", "Land mask", False),
                   ui.input_switch("toggle_ocean", "Ocean mask", True),
                   ui.input_switch("toggle_lakes", "Lake mask", False),
                #    ui.input_switch("toggle_countries", "Countries", False),
                #    ui.input_switch("toggle_states", "States / provinces", False),
                   ),
            width=3,
        ),
        ui.panel_main({"id": "map"},
            # https://shiny.posit.co/py/api/ui.tags.html#shiny.ui.tags.script
            # ui.tags.script(""" """),
            ui.include_js("load_map.js", method="inline"),
        ),
    )
)

def server(input, output, session):
    ...

app = App(app_ui, server)