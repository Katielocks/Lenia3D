# -*- coding: utf-8 -*-


import plotly.graph_objs as go
import plotly.io as pio
pio.renderers.default = 'browser'

import mesh
import numpy as np
import functions as f

# Define a function called plot_mesh that takes in several parameters
def plot_mesh(time,frames,radius,m,s,grid_size,cluster_num = 40,cluster_size = (2,8),seed =None):
    """
    seed: an integer used to initialize the random number generator for generating the initial state of the system
    time: the number of time steps to run the simulation
    frames: the number of frames to use for the animation
    radius: the radius of the kernel used for the convolution in the Game of Life update step
    m: a float representing the birth threshold for the Game of Life update step
    s: a float representing the survival threshold for the Game of Life update step
    grid_size: the size of the grid on which the simulation is run
    cluster_num: the number of clusters to generate in the initial state of the system (default value is 40)
    cluster_size: a tuple representing the range of sizes for the clusters generated in the initial state of the system (default value is (2,8))"""
    layout = go.Layout(
        scene=dict(
        xaxis=dict(range=[0, grid_size] ,showgrid=False,color='black'),
        yaxis=dict(range=[0, grid_size] ,showgrid=False),
        zaxis=dict(range=[0, grid_size] ,showgrid=False),
        aspectmode='manual',
        aspectratio=dict(x=1, y=1, z=1),
    ),
    title='Lenia3d : An Lenia Extenstion',
    updatemenus=[dict(
        type='buttons',
        showactive=False,
        buttons=[dict(
            label='Play',
            method='animate',
            args=[None, dict(frame=dict(duration=int(10/frames), redraw=True), fromcurrent=True)]
        ), dict(
            label='Pause',
            method='animate',
            args=[[None], dict(frame=dict(duration=0), mode='immediate', transition=dict(duration=0))]
        )]
    )]
    )  
    # Generate a state grid using the state_gen function
    grid = f.generate_random_state(cluster_num,cluster_size,grid_size,seed=seed)
    # Convert the state grid to a sparse tensor and coalesce it to eliminate duplicates
    frame = generate_frame(grid)
    
    # Create a list of frames to be used for animation
    frames_list = [frame]
    # Generate a kernel using kernel_gen function from module f
    kernel = f.generate_kernel(radius,grid_size)
    
    # Run the Game of Life update loop
    for i in range(time*frames):
        grid = f.golupdate(grid,kernel,frames,m,s)
        if np.any(grid):
            frames_list.append(generate_frame(grid))
        else:
            break
    # Create figure object
    fig = go.Figure(data=[], layout=layout, frames=frames_list)
    fig.add_trace(frames_list[0].data[0])
    # Show figure
    fig.show()
    
    
    
def generate_frame(grid):
    
    cluster_arr= c.generate_cluster_array(grid)
    vertices,faces,face_values = c.global_voxel_mesh(cluster_arr)
    triangles =  mesh.generate_triangles(faces)
    face_values = face_values.repeat(2)
    
    # Define a Mesh3d trace using the vertex, triangle, and color information
    trace = go.Mesh3d(
    x=vertices[:, 2],
    y=vertices[:, 1],
    z=vertices[:, 0],
    i=triangles[:, 2],
    j=triangles[:, 1],
    k=triangles[:, 0],
    flatshading=True,
    colorscale='thermal',
    intensity=face_values
    )
    
    return go.Frame(data=[trace])
