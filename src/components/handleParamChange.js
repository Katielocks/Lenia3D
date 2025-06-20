/**
 * handleParamChange updates either top-level fields (like dim, range, density)
 * or sub-fields under params (like R, T, b, etc). It also handles array indexing.
 *
 * @param {function} setFn - A state setter (e.g. setSimState or setGenState).
 * @param {string} path - Field to update (e.g. 'dim', 'R', 'range').
 * @param {any} newValue - The new value to store.
 * @param {string|null} subpath - If 'params', updates the nested 'params' object; otherwise top-level.
 * @param {number|null} index - If the field is an array, which index to update.
 */
export function handleParamChange(setFn, path, newValue, subpath = null, index = null) {
  setFn(prev => {
    let oldVal = subpath && prev[subpath]
      ? prev[subpath][path]
      : prev[path];

    // If oldVal is an array and we have an index, update that element
    if (Array.isArray(oldVal) && typeof index === 'number') {
      const updatedArray = [...oldVal];
      updatedArray[index] = newValue;

      if (subpath && prev[subpath]) {
        return {
          ...prev,
          [subpath]: {
            ...prev[subpath],
            [path]: updatedArray,
          },
        };
      } else {
        return {
          ...prev,
          [path]: updatedArray,
        };
      }
    }

    // Otherwise, set directly
    if (subpath && prev[subpath]) {
      return {
        ...prev,
        [subpath]: {
          ...prev[subpath],
          [path]: newValue,
        },
      };
    } else {
      return {
        ...prev,
        [path]: newValue,
      };
    }
  });
}
