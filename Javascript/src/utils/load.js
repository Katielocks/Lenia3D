import * as tf from '@tensorflow/tfjs'
import {animalArr} from '../data/animals3D.js'
const DIM_DELIM = {0:'', 1:'$', 2:'%', 3:'#', 4:'@A', 5:'@B', 6:'@C', 7:'@D', 8:'@E', 9:'@F'}
const DIM = 3
 
export function SelectAnimalID(id) {
    if (id < 0 || id >= animalArr.length) return;
    var a = animalArr[id];
    if (Object.keys(a).length < 4) return;
    const cellSt = a['cells'];
    const tensor = rle2arr(cellSt);
    const params = Object.assign({}, a['params'])
    const type = SelectType(id)
    params['b'] = st2fracs(params['b'])

    return {tensor,type,params,id}
}
function SelectType(id) {
    let names = []
    let i = id
    let currcode = animalArr[id]['code']
    while (i >= 0) {
        const a = animalArr[i]
        if (Object.keys(a).length == 3 && a['code'] !== currcode) {
            let name = a['name']
            name = name.split(' ').slice(1).join(' ')
            names.push(name)
            
            currcode = a['code']
        }
        i--
    }
    return names.reverse().join(' ')
}
function rle2arr(st) {
    var stacks = [];
    for (var dim = 0; dim < DIM; dim++) {
        stacks.push([]);
    }
    var last = '';
    var count = '';
    var delims = Object.values(DIM_DELIM);
    st = st.replace(/!$/, '') + DIM_DELIM[DIM - 1];
    for (var i = 0; i < st.length; i++) {
        var ch = st[i];
        if (/\d/.test(ch)) {
            count += ch;
        } else if ('pqrstuvwxy@'.includes(ch)) {
            last = ch;
        } else {
            if (!delims.includes(last + ch)) {
                _append_stack(stacks[0], ch2val(last + ch) / 255, count, true);
            } else {
                var dim = delims.indexOf(last + ch);
                for (var d = 0; d < dim; d++) {
                    _append_stack(stacks[d + 1], stacks[d], count, false);
                    stacks[d] = [];
                }
            }
            last = '';
            count = '';
        }
    }
    var A = stacks[DIM - 1];
    var max_lens = [];
    for (var dim = 0; dim < DIM; dim++) {
        max_lens.push(0);
    }
    _recur_get_max_lens(0, A, max_lens);
    _recur_cubify(0, A, max_lens);
    return tf.tensor(A);
    }
function _append_stack(list1, list2, count, is_repeat = false) {
        list1.push(list2);
        if (count !== '') {
            var repeated = is_repeat ? list2 : [];
            for (var i = 0; i < parseInt(count) - 1; i++) {
                list1.push(repeated);
            }
        }
    }
    
function ch2val(c) {
    if (c === '.' || c === 'b') return 0;
    else if (c === 'o') return 255;
    else if (c.length === 1) return c.charCodeAt(0) - 'A'.charCodeAt(0) + 1;
    else return (c.charCodeAt(0) - 'p'.charCodeAt(0)) * 24 + (c.charCodeAt(1) - 'A'.charCodeAt(0) + 25);
    }
    
function _recur_get_max_lens(dim, list1, max_lens) {
    max_lens[dim] = Math.max(max_lens[dim], list1.length);
    if (dim < DIM - 1) {
        for (var i = 0; i < list1.length; i++) {
            _recur_get_max_lens(dim + 1, list1[i], max_lens);
        }
    }
    }
    
function _recur_cubify(dim, list1, max_lens) {
    var more = max_lens[dim] - list1.length;
    if (dim < DIM - 1) {
        for (var i = 0; i < more; i++) {
            list1.push([]);
        }
        for (var i = 0; i < list1.length; i++) {
            _recur_cubify(dim + 1, list1[i], max_lens);
        }
    } else {
        for (var i = 0; i < more; i++) {
            list1.push(0);
        }
    }
    }
function st2fracs(string) {
    let splitValues = string.split(","); // Split the string by commas

    let result = [];

    for (let i = 0; i < splitValues.length; i++) {
        let value = splitValues[i];

        if (value.includes("/")) {
        let fractionParts = value.split("/");
        let numerator = parseInt(fractionParts[0]);
        let denominator = parseInt(fractionParts[1]);
        let convertedValue = numerator / denominator;
        result.push(convertedValue);
        } else {
        result.push(parseInt(value));
        }
    }

    return result;
}

