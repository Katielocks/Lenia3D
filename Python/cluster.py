# -*- coding: utf-8 -*-

from scipy import ndimage as nd
import mesh
import torch

def generate_cluster_array(grid):
    cluster_arr = []
    mask_grid= grid.astype(bool)
    cluster_slices = nd.find_objects(mask_grid)
    for slc in cluster_slices:
        local = torch.tensor([slc[i].start for i in range(3)])
        cluster_arr.append(cluster_obj(local,grid[slc]))
    return cluster_arr

class cluster_obj:
    def __init__(self,local,tensor):
        self.local = local
        self.grid = tensor
        self.vertices,self.faces,self.face_values = mesh.generate_voxel(tensor)

def global_voxel_mesh(cluster_arr):
    i = 0
    vertices = torch.empty(0,3)
    faces  = torch.empty(0,4)
    face_values = torch.empty(0)
    for cluster in cluster_arr:
        vertices = torch.vstack((vertices,cluster.vertices+cluster.local))
        faces = torch.vstack((faces,cluster.faces+i))
        face_values = torch.cat((face_values,cluster.face_values))
        i += len(cluster.vertices)
    return vertices,faces,face_values
