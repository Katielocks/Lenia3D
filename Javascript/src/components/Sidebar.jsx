import React, { useContext } from 'react';
import { EngineContext } from '../App';
export const Sidebar = () => {
   const { uiState, setUiState } = useContext(EngineContext);
  // Map sidebar states to widths
  const widthMapping = {
    open: '140px',
    reduced: '41px',
    collapsed: '0px'
  };
  return (
    <nav id="sidebar" className='sidebar' style = {{position: uiState.layout=='row-main' ? 'relative' : 'fixed'}}>
      <ul className="sidebarmenu" style={{ width: widthMapping[uiState.sidebarState] }}>
        
        <li className="nav-item">
          <a className="nav-link"  onClick={(e)=>setUiState((prev) => ({ ...prev, menumode: 'generate', }))} href="#" aria-current="page" aria-label="Generate">
            <img src={`${process.env.PUBLIC_URL}/assets/images/generate.png`} id="generate" alt="Generate Icon" className="nav-icon" /> 
            <span className="nav-link-text">Generate</span>
          </a>
        </li>
        <li className="nav-item">
                    <a className="nav-link" onClick={(e)=> setUiState((prev) => ({ ...prev, menumode: 'edit' }))} href="#" aria-current="page" aria-label="Edit">
            <img src={`${process.env.PUBLIC_URL}/assets/images/edit.png`} id="edit" alt="Edit Icon" className="nav-icon" />
            <span className="nav-link-text">Edit</span>
          </a>
        </li>
      </ul> 
    </nav>
  );
};
