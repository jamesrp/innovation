export const colorMapBackground = {
    "white": "#dedeeef",
    "green": "#b5e7a0",
    "red": "#eea29a",
    "blue": "#92a8d1",
    "yellow": "#ffef96",
    "purple": "#b19CD9",
    "brown": "#dac292",
    "clear": "#cccccc",
}

export function facedownCardStyle(color) {
    return {
        border: '1px solid #555',
        width: '50px',
        height: '50px',
        lineHeight: '50px',
        textAlign: 'center',
        "background-color": colorMapBackground[color],
    };
}

export function cellStyle(color) {
    return {
        border: '1px solid #555',
        width: '100px',
        height: '50px',
        lineHeight: '50px',
        textAlign: 'center',
        "background-color": colorMapBackground[color],
    };
}

export function cellStyleElements(color) {
    return {
        border: '1px solid #555',
        width: '490px',
        height: '50px',
        lineHeight: '50px',
        textAlign: 'center',
        "background-color": colorMapBackground[color],
    };
}

export function cellStyleInnovation(color) {
    return {
        padding: '2px',
        'vertical-align': 'top',
        // 'text-align': 'left',
        position: 'relative',
        margin: '5px',
        border: '1px solid #555',
        width: '200px',
        height: '50px',
        // lineHeight: '50px',
        // textAlign: 'center',
        "background-color": colorMapBackground[color],
    };
}

export function cellStyleClickable(color, clickable) {
    let s = cellStyle(color);
    if (clickable) {
        s.border = '3px solid #555';
    }
    return s;
}

export function cellStyleSide(color, clickable) {
    let s = cellStyle(color);
    s.width = '80px';
    if (clickable) {
        s.border = '3px solid #555';
    }
    return s;
}

export function handStyle(color) {
    return {
        border: '1px solid #555',
        width: '150px',
        height: '25px',
        lineHeight: '25px',
        textAlign: 'center',
        "background-color": colorMapBackground[color],
    };
}

export function buttonStyle(clickable) {
    let border = '1px solid #555';
    if (clickable) {
        border = '3px solid #555';
    }
    return {
        border: border,
        width: '120px',
        height: '25px',
        lineHeight: '25px',
        textAlign: 'center',
    };
}

export function boardStyle() {
    return {
        textAlign: 'center',
    };
}

export function tableStyle() {
    return {
        margin: 'auto',
    };
}