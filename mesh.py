# -*- coding: utf-8 -*-
"""
Created on Wed Apr  5 13:17:57 2023

@author: ktwhi
"""
import torch
import numpy as np
def generate_voxel(grid, offset, offset_faces):
    """
    mesh_gen : a function which takes in indices of a 3d tensor and generates a simplifed voxel mesh
    
    grid : 3d pytorch tensor
    offset : relative vertices
    offset_faces : faces of relative vertices
    
    """
    #get nonzero indices and generate a face index tensor
    indices = grid.indices().t()   
    faces = torch.arange(len(indices)).reshape(len(indices), 1) 
    
    #create a tensor representing face color 
    face_colors  = grid.values().repeat_interleave(6)
    
    #Apply offset faces to faces
    faces = 8 * faces.view(faces.shape[0], 1, faces.shape[1]) + offset_faces 
    faces = faces.view(-1, faces.shape[-1]) 

    # Apply offset to each vertex
    vertices = indices.view(indices.shape[0], 1, indices.shape[1]) + offset + 1 
    vertices = vertices.reshape(len(vertices) * 8, 3)

    # Generate a index map for sorting indices
    vertices_flipped = torch.flip(vertices, [1]).numpy() 
    
    verts_map = torch.tensor(np.lexsort(vertices_flipped.T))
    vertices = vertices[verts_map]
    
    #realign faces
    inv_vert_map = torch.empty_like(verts_map)
    inv_vert_map[verts_map] = torch.arange(len(verts_map))
    faces = inv_vert_map[faces]

    # represent vertices as a sparse tensor, and remove duplicate vertices
    vertices_coo = torch.sparse_coo_tensor(2 * vertices.t(), torch.ones(len(vertices)), tuple((2 * torch.tensor(grid.shape) + 1).tolist()))
    vertices_coo = vertices_coo.coalesce()
    vertices = vertices_coo.indices().t() / 2
    values = vertices_coo.values()

    # generate map from vertices which have duplicates to non duplicate vertices
    vertex_map = torch.arange(len(values)).repeat_interleave(values.long())
    faces = vertex_map[faces]
    
    #sorts faces to match faces_coo output
    sorted_faces = torch.flip(torch.sort(faces, dim=1)[0], [1]).numpy()
    index_map = torch.tensor(np.lexsort(sorted_faces.T))
    faces = faces[index_map]
    #create a count of faces
    faces_coo = torch.sparse_coo_tensor(torch.sort(faces, dim=1)[0].t()[:3], torch.ones(len(faces)), tuple([len(vertices)] * 3))
    faces_coo = faces_coo.coalesce()
    values = faces_coo.values()

    # Filter out faces which have atleast one duplicate
    mask = (values < 2).repeat_interleave(values.long())
    faces = faces[mask]
    face_colors = face_colors[mask]
    # Return the vertices, square indices, and color values
    return vertices, faces, face_colors

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