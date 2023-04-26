import torch
def dir_kernel(grid):
   # Convert the grid to a boolean tensor and add two dimensions to make it compatible with the convolution operation
   grid = grid.bool().unsqueeze(0).unsqueeze(0).float()
   
   # Define the weights of the directional kernel
   kern_weights = torch.tensor(
       [[[0, 0, 0],
         [0, -4, 0],
         [0, 0, 0]],

        [[0, -32, 0],
         [-1, 63, -8],
         [0, -16, 0]],

        [[0, 0, 0],
         [0, -2, 0],
         [0, 0, 0]]])
   
   dir_kernel = kern_weights.unsqueeze(0).unsqueeze(0).float()
   dir_grid = torch.multiply(grid,torch.nn.functional.conv3d(grid, dir_kernel, padding=1).int())
   
   # Remove the extra dimensions and return the edge detected grid
   dir_grid = dir_grid.squeeze(0).squeeze(0)
   return dir_grid

def generate_voxel(grid):
    """
    Generate cuboid voxel mesh of a given 3D grid.

    Args:
        grid: A 3D numpy array or PyTorch tensor representing the input grid.

    Returns:
        A tuple containing:
        - vertices: A 2D tensor of shape (N, 3) representing the unique vertices of the voxel geometry.
        - faces: A 2D tensor of shape (M, 4) representing the faces of the voxel geometry, where each row is a set of indices into the vertices tensor.
        - face_values: A 1D tensor of length M representing the value of each face of the voxel geometry, taken from the corresponding index in the input grid.
    """

    # Convert input grid to a PyTorch tensor
    grid = torch.tensor(grid)

    # Define the eight vertices of a cube with an offset tensor
    offset = torch.tensor([
        [-0.5, -0.5, -0.5], # vertex 0
        [ 0.5, -0.5, -0.5], # vertex 1
        [ 0.5,  0.5, -0.5], # vertex 2
        [-0.5,  0.5, -0.5], # vertex 3
        [-0.5, -0.5,  0.5], # vertex 4
        [ 0.5, -0.5,  0.5], # vertex 5
        [ 0.5,  0.5,  0.5], # vertex 6
        [-0.5,  0.5,  0.5], # vertex 7
    ])

    # Define the faces of the cube as offsets into the vertex tensor
    offset_faces = torch.tensor([
        [0, 1, 2, 3], # face 0
        [1, 5, 6, 2], # face 1
        [4, 0, 3, 7], # face 2
        [5, 4, 7, 6], # face 3
        [3, 2, 6, 7], # face 4
        [4, 5, 1, 0], # face 5
    ])

    # Apply a directional kernel to the input grid, and extract the indices and values of the non-zero elements
    dir_grid = dir_kernel(grid)
    dir_indices = dir_grid.nonzero()
    dir_values = dir_grid[dir_indices[:,0],dir_indices[:,1],dir_indices[:,2]]

    # Convert the values into a binary representation of the direction in which the voxel should be extruded
    direction = torch.fmod(torch.floor_divide(dir_values.unsqueeze(1), torch.pow(2, torch.arange(5, -1, -1))), 2)
    direction = torch.flip(direction, [1])

    # Calculate the set of vertices and faces that form the extruded geometry, given the binary direction
    face_vertices = offset[offset_faces]
    vertices = torch.vstack([face_vertices[dir_m]+dir_indices[i] for i,dir_m in enumerate(direction.bool())])
    faces = torch.arange(len(vertices)*4,dtype=int).reshape(vertices.shape[0],4)

    # Flatten the vertices and eliminate any duplicates, along with corresponding faces, to ensure that the geometry is well-formed
    vertices, imap = torch.unique(vertices,dim=0,return_inverse=True)
    faces = imap[faces]
    
    # Align the faces with their voxel's value
    faces_count = torch.bincount(direction.nonzero().t()[0])
    face_values = grid[dir_indices[:,0],dir_indices[:,1],dir_indices[:,2]]
    face_values = face_values.repeat_interleave(faces_count)
    
    return vertices,faces,face_values

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
