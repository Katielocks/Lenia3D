# -*- coding: utf-8 -*-
"""
Created on Wed Apr  5 13:17:57 2023

@author: ktwhi
"""
import torch
import numpy as np
def generate_voxel(grid, offset, offset_faces):
    # Get the non-zero indices of the grid and generate a face index array
    indices = grid.nonzero()
    # Create a array representing face color 
    face_colors  = np.repeat(grid[indices],6)
    #generate indices and faces arrays
    indices = np.transpose(np.stack(indices)) 
    faces = np.arange(len(indices)).reshape(len(indices), 1) 
    # Apply offset faces to faces
    faces = 8 * faces.reshape(faces.shape[0], 1, faces.shape[1]) + offset_faces 
    faces = faces.reshape(-1, faces.shape[-1]) 
    # Apply offset to each vertex
    vertices = indices.reshape(indices.shape[0], 1, indices.shape[1]) + offset
    vertices = vertices.reshape(len(vertices) * 8, 3)
    # Remove duplicate vertices
    vertices, index,counts = np.unique(vertices, axis=0, return_inverse=True,return_counts=True)
    faces = index[faces]
    # generate mask for unique faces
    center = np.mean(vertices[faces],axis=1)
    center, index, count = np.unique(center, axis=0, return_index=True,return_counts=True)
    center = center[count<2]
    index = index[count<2]
    mask = np.zeros(len(faces), dtype=bool)
    mask[index] = True
    #Apply mask
    faces = faces[mask]
    face_values = face_colors[mask]
    return vertices, faces, face_values

def generate_triangles(shapes):
    """
    input : 
        shapes: input tensor of n sided polygon faces of a mesh
    output :
        triangles faces of a mesh
    
    """
    triangle_index = torch.arange(shapes.shape[1]-2)+1
    triangle_index = torch.vstack((triangle_index,triangle_index+1))
    triangle_index = torch.vstack((torch.zeros(shapes.shape[1]-2),triangle_index)).t()
    triangles = shapes[:, triangle_index.long()]
    triangles = triangles.reshape(-1,triangles.shape[2])
    return triangles
