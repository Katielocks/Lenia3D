  // ---------------------------------------------------------------------------
    // "Pregenerated" patterns or "animal" list
    // ---------------------------------------------------------------------------
    import {animalArr} from '../data/animals3D.js'
    
    export function PopulateAnimalList(engine, setSimState){
      if (typeof animalArr === 'undefined') return;
      const list = document.getElementById("AnimalList");
      if (!list) return;
  
      list.innerHTML = "";
      let lastCode = "";
      let lastEng0 = "";
      let node = list;
      let currLevel = 0;
  
      for (let i=0; i<animalArr.length; i++) {
        const a = animalArr[i];
        if (Object.keys(a).length >= 3) {
          let codeSt = a['code'].split("(")[0];
          let engSt  = a['name'].split(" ");
          if (codeSt.startsWith("~")) codeSt = codeSt.substring(1);
          if (codeSt.startsWith("*")) codeSt = "";
          const sameCode = codeSt !== "" && (codeSt === lastCode);
          const sameEng0 = engSt[0] !== "" && (engSt[0] === lastEng0);
          lastCode = codeSt;
          lastEng0 = engSt[0];
  
          if (Object.keys(a).length >= 4) {
            const cellSt = a['cells'];
            const st = cellSt.split(";");
            let ruleSt = "";
            if (st.length >= 3) {
              ruleSt = st[0].trim()+";"+st[1].trim()+";"+st[2].trim();
            }
            const li = node.appendChild(document.createElement("LI"));
            li.classList.add("action", "parameter-row");
            const text = li.appendChild(document.createElement("DIV"));
            text.style.position = "absolute";
            text.style.left = "0";
            text.style.marginLeft = "2vw";
  
            const code = li.appendChild(document.createElement("DIV"));
            code.style.position = "absolute";
            code.style.right = "0";
  
            text.title = a[0] + " " + engSt.join(" ") + "\n" + ruleSt;
            if (sameCode) codeSt = " ".repeat(codeSt.length);
            if (sameEng0) engSt[0] = lastEng0.substring(0, 1) + ".";
            text.innerHTML = engSt.join(" ");
            li.style.color = "#cdd0d6";
            li.style.width = "calc(100% - 2vw)";
            code.innerHTML = codeSt;
  
            li.dataset["animalid"] = i;
            li.addEventListener("click", (e) => SelectAnimalItem(e, engine, setSimState));
          } else if (Object.keys(a).length === 3) {
            const nextLevel = parseInt(codeSt.substring(1));
            const diffLevel = nextLevel - currLevel;
            const backNum = (diffLevel <= 0) ? -diffLevel+1 : 0;
            const foreNum = (diffLevel > 0) ? diffLevel : 1;
  
            for (let k=0; k<backNum; k++) {
              node = node.parentElement;
              if (node.tagName === "LI") node = node.parentElement;
            }
            node = node.appendChild(document.createElement("LI"));
            node.classList.add("group");
            const div = node.appendChild(document.createElement("DIV"));
            div.classList.add("parameter-row");
  
            const text = div.appendChild(document.createElement("DIV"));
            text.style.position = "absolute";
            text.style.left = "0";
            text.style.marginLeft = "1vw";
  
            const arrow = div.appendChild(document.createElement("DIV"));
            arrow.classList.add("arrow");
            text.title = engSt;
            text.innerHTML = engSt[engSt.length-1];
  
            const scalar = Math.pow(8/9, nextLevel);
            const fontsize = scalar*20;
            const padding  = scalar*3;
  
            div.style.fontSize  = `${fontsize}px`;
            div.style.color     = "#cdd0d6";
            text.style.paddingBottom = `${padding}%`;
            div.style.paddingTop     = `${padding}%`;
  
            div.addEventListener("click", function () {
              this.parentElement.classList.toggle("closed");
              arrow.classList.toggle("sideways");
            });
  
            for (let k=0; k<foreNum; k++) {
              node = node.appendChild(document.createElement("UL"));
            }
            currLevel = nextLevel;
          }
        }
      }
    }
  
    function SelectAnimalItem(e, engine, setSimState) {   // <--- Add engine parameter
        const item = e.target.closest("LI");
        if (!item) return;
        const idStr = item.dataset["animalid"];
        if (!idStr) return;
        const animalID = parseInt(idStr);
        engine.loadAnimal(animalID);  // <--- Use the passed engine
        if (setSimState) {
          setSimState(prev => ({
            ...prev,
            seed: engine.seed,
            name: engine.name,
            dim: engine.shape,
          }));
        }
      }