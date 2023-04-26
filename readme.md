# **Lenia3D**: Extension of Lenia

Lenianet is an extension of Lenia into the 3rd dimension. 
## **Requirements**

    pytorch
    numpy
    plotly
    
## 

## **Implementation**

This simulation is based on rules from lenia, found [here](https://en.wikipedia.org/wiki/Lenia).


However, we define the extended grid, $A$ to be a 3D tensor with values $\[ 0,1 \]$  and we define the kernel, $K$, to be

$$K = \frac{1}{\sum \[ K \] }\operatorname{bell}(\frac{D}{R},\mu=0.5,\sigma=0.15) $$

Where $D$ is the a $G \times G \times G$ tensor where $D_{i,j,k} = \  \mid \left \[ \frac{G}{2} \right \] -(i,j,k) \mid$ and the bell function is the gaussian function defined in Lenia
## 
We know that, for game grid, $A$, and potential $U$, using the convolution theorem,

$$U = K * A = \mathcal{Re}\left( \mathcal{F^{-1}} \left( \mathcal{F}(K_s) \cdot \mathcal{F}(A) \right) \right) $$

Where $\mathcal{F}$ is the fourier transform and $K_s$ is the shifted kernel where the zero-frequency component is shifted to the center of the spectrum.
## **Installisation**

To use this extension, simply download the code from the repository and use 'plot_mesh' in 'plotting.py'. 
## **Credits**

This extension was developed by Katie Whitelock based on the original Lenia code by Bert Wang-Chak Chan.

