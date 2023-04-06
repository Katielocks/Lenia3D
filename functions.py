# -*- coding: utf-8 -*-
"""
Created on Wed Apr  5 00:39:23 2023

@author: ktwhi
"""
import torch
import numpy as np

import plotly.graph_objs as go
import plotly.graph_objects as go
import plotly.io as pio
pio.renderers.default = 'browser'

import mesh

def generate_random_state( cluster_num, cluster_size, grid_size,seed=None):
    """
   Generates a 3D grid with randomly distributed clusters of given sizes.

   Parameters:
   - seed (int): Seed value for the PyTorch random number generator.
   - cluster_num (int): Number of clusters to generate.
   - cluster_size (tuple of ints): Range of cluster sizes (inclusive).
   - grid_size (int): Size of the 3D grid to generate.

   Returns:
   - grid (torch.Tensor): 3D tensor representing the generated grid.
   """
    if seed == None:
        seed = torch.randint(0,10**8,(1,)).item()
        print(seed)
    torch.manual_seed(seed)
    # Use PyTorch's random.randint function to generate random cluster numbers
    cluster_size = torch.randint(cluster_size[0],cluster_size[1],(cluster_num,))
    clusters = torch.randint(grid_size, size=[cluster_num,3])
    grid = torch.sparse_coo_tensor(torch.empty((3,0),dtype=torch.int64),torch.empty(0),tuple([grid_size]*3))
    for i , cluster in enumerate(clusters):
        n = cluster_size[i]
        tensor = torch.rand((n,n,n))
        tensor = tensor.to_sparse().coalesce()
        new_indices = torch.remainder(tensor.indices().t()+cluster,grid_size)
        cluster_coo  = torch.sparse_coo_tensor(new_indices.t() , tensor.values(),tuple([grid_size]*3))
        grid += cluster_coo
    grid = grid.to_dense()
    
    return grid


def generate_kernel(radius, grid_size):
    """
    Generates a 3D kernel for updating the grid using the Game of Life rules.

    Parameters:
    - R (float): Radius parameter for the kernel.
    - grid_size (int): Size of the 3D grid.

    Returns:
    - fK (torch.Tensor): 3D tensor representing the generated kernel.
    """
    mid = grid_size//2  
    bell = lambda x, m, s: np.exp(-((x-m)/s)**2 / 2)
    D = np.linalg.norm(np.ogrid[-mid:mid, -mid:mid,-mid:mid]) / radius
    K = (D<1) * bell(D, 0.5, 0.15)
    fK = np.fft.fftn(np.fft.fftshift(K / np.sum(K)))
    fK = torch.tensor(fK)
    return fK


def golupdate(grid,kernel,frames_num,m,s):
    """
    Updates the input grid using the Game of Life rules.
    
    Parameters:
    - grid (torch.Tensor): 3D tensor representing the input grid.
    - kernel (torch.Tensor): 3D tensor representing the kernel to use for the update.
    - frames_num (int): Number of frames to update the grid.
    - m (float): Mean value for the growth function.
    - s (float): Standard deviation value for the growth function.
    
    Returns:
    - grid (torch.Tensor): 3D tensor representing the updated grid.
    """
    U = torch.real(torch.fft.ifftn(kernel * torch.fft.fftn(grid)))
    grid = torch.clamp(grid + 1/frames_num * growth(U,m,s), 0, 1)
    return grid

def growth(U,m,s): 
    """
    Computes the growth function for updating the grid using the Game of Life rules.

    Parameters:
    - U (torch.Tensor): 3D tensor representing the input for the growth function.
    - m (float): Mean value for the growth function.
    - s (float): Standard deviation value for the growth function.

    Returns:
    - result (torch.Tensor): 3D tensor representing the computed growth function.
    """
    bell = lambda x, m, s: np.exp(-((x-m)/s)**2 / 2)
    return bell(U, m, s)*2-1

