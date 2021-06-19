import React from 'react';

import "./InnovationBoard.css";
import {colors, ages, symbols, symbolCounts} from './InnovationGame';
import {
    cellStyleInnovation,
    cellStyleSide,
    colorMapBackground,
    facedownCardStyle,
    handStyle,
    tableStyle
} from "./styles";
import {message, reverseArray} from "./common";

const symbolImages = {
    'bulb': 'https://jrp-bgio.s3-us-west-2.amazonaws.com/innovation-assets/bulb.png',
    'crown': 'https://jrp-bgio.s3-us-west-2.amazonaws.com/innovation-assets/crown.png',
    'castle': 'https://jrp-bgio.s3-us-west-2.amazonaws.com/innovation-assets/castle.png',
    'leaf': 'https://jrp-bgio.s3-us-west-2.amazonaws.com/innovation-assets/leaf.png',
    'factory': 'https://jrp-bgio.s3-us-west-2.amazonaws.com/innovation-assets/factory.png',
    'clock': 'https://jrp-bgio.s3-us-west-2.amazonaws.com/innovation-assets/clock.png',
    'hex': 'https://jrp-bgio.s3-us-west-2.amazonaws.com/innovation-assets/hex.png',
    '': 'https://jrp-bgio.s3-us-west-2.amazonaws.com/innovation-assets/transparent.png',
}

export class InnovationBoard extends React.Component {
    render() {
        let msg = message(this.props.ctx, this.props.playerID);

        let decks = [];
        ages.forEach(element => decks.push(
            <li>
                Age {element} : {this.props.G.decks[element].length} cards left
            </li>
        ))

        let opp = "0";
        if (this.props.playerID === "0") {
            opp = "1";
        }

        let clickHandlers = {
            myHand: this.props.moves.MeldAction,
            myBoard: this.props.moves.DogmaAction,
            achievements: this.props.moves.AchieveAction,
        }
        if (this.props.ctx.phase === "resolveStack") {
            clickHandlers = {
                myHand: this.props.moves.ClickCard,
                myBoard: this.props.moves.ClickCard,
                myScore: this.props.moves.ClickCard,
            }
        }

        let mySymbols = renderSymbols(symbolCounts(this.props.G[this.props.playerID].board));
        let oppSymbols = renderSymbols(symbolCounts(this.props.G[opp].board));
        let tbody = [];
        tbody.push(renderFacedownZone(this.props.G[opp].hand, "Opp hand"));
        tbody.push(renderBoard(this.props.G[opp].board, "Opp Board", null, oppSymbols));
        tbody.push(renderFacedownZone(this.props.G[opp].score, "Opp score"));
        tbody.push(renderFacedownZone(this.props.G[opp].achievements, "Opp Achievements"));
        tbody.push(renderFacedownZone(this.props.G.achievements, "Available Achievements", clickHandlers.achievements));
        let decksA = Array.of(1, 2, 3, 4, 5).flatMap(age => <td
            style={facedownCardStyle(this.props.G.decks[age].length === 0 ? 'grey' : 'brown')}> Age {age} [{this.props.G.decks[age].length}]</td>);
        let decksB = Array.of(6, 7, 8, 9, 10).flatMap(age => <td
            style={facedownCardStyle(this.props.G.decks[age].length === 0 ? 'grey' : 'brown')}> Age {age} [{this.props.G.decks[age].length}]</td>);
        tbody.push(<tr onClick={() => this.props.moves.DrawAction()}>
            <td style={cellStyleSide('clear', false)}>Decks</td>
            {decksA}</tr>);
        if (this.props.ctx.phase === "resolveStack") {
            // TODO bug - shouldn't stack always have something in it if we have it?
            // if (this.props.G.stack.length !== 0) {
            //     let topStackable = this.props.G.stack[this.props.G.stack - 1];
            //     if (topStackable.menuOptions !== undefined) {
            //         menu = renderList(topStackable.menuOptions, "Menu options", x => x, element => this.props.moves.ClickMenu(element));
            //     }
            // }
            tbody.push(<tr>
                <td style={cellStyleSide('red', false)}>The Stack</td>
                <div>
                    {renderList(this.props.G.stack, "The Stack", x => x.name + "[player " + x.playerID + "]")}
                    {renderList(Array.of("yes", "no"), "Menu options", x => x, element => this.props.moves.ClickMenu(element))}
                </div>
            </tr>);
        }
        tbody.push(<tr onClick={() => this.props.moves.DrawAction()}>
            <td style={cellStyleSide('clear', false)}>Decks</td>
            {decksB}</tr>);
        tbody.push(renderFacedownZone(this.props.G[this.props.playerID].score, "My score", clickHandlers.myScore));
        tbody.push(renderFacedownZone(this.props.G[this.props.playerID].achievements, "My Achievements"));
        tbody.push(renderBoard(this.props.G[this.props.playerID].board, "My Board", clickHandlers.myBoard, mySymbols));
        let handBody = renderHand(this.props.G[this.props.playerID].hand, clickHandlers.myHand);
        tbody.push(<tr>
            <td style={cellStyleSide('clear', false)}>My Hand</td>
            <td colspan="5">
                <table style={tableStyle()}>
                    <tbody>{handBody}</tbody>
                </table>
            </td>
        </tr>);


        let msg1 = '';
        if (this.props.ctx.phase === "resolveStack") {
            // TODO bug - shouldn't stack always have something in it if we have it?
            // if (this.props.G.stack.length !== 0) {
            //     let topStackable = this.props.G.stack[this.props.G.stack - 1];
            //     if (topStackable.menuOptions !== undefined) {
            //         menu = renderList(topStackable.menuOptions, "Menu options", x => x, element => this.props.moves.ClickMenu(element));
            //     }
            // }
            msg1 = <div>
                <h4>Resolving stack...</h4>
                {renderList(this.props.G.stack, "The Stack", x => x.name + "[player " + x.playerID + "]")}
                {renderList(Array.of("yes", "no"), "Menu options", x => x, element => this.props.moves.ClickMenu(element))}
            </div>;
        }
        return (
            <div>
                <h3> Player {this.props.playerID} board {msg}</h3>
                {msg1}
                <table style={tableStyle()}>
                    <tbody>{tbody}</tbody>
                </table>
                <hr/>
                {renderList(this.props.G.log, "Log", x => x)}
            </div>
        );
    }
}

function renderList(arr, name, nameFn, onClickFn) {
    let lis = [];
    arr.forEach(element => {
        if (onClickFn === undefined || onClickFn === null) {
            lis.push(
                <li>
                    {nameFn(element)}
                </li>
            )
        } else {
            lis.push(
                <li onClick={() => onClickFn(element)}>
                    {nameFn(element)}
                </li>
            )
        }
    })
    return <div>
        <h4>{name}</h4>
        <ul>{lis}</ul>
    </div>
}

function renderFacedownZone(zone, msg, onClick) {
    let content = zone.flatMap(c => {
        if (onClick === undefined || onClick === null) {
            return <td style={facedownCardStyle('brown')}>{c.age}</td>;
        }
        return <td onClick={() => onClick(c.id)} style={facedownCardStyle('brown')}>{c.age}</td>;
    });
    return <tr>
        <td style={cellStyleSide('clear', false)}>{msg}</td>
        <td colspan="5">
            <table>
                <tr>
                    <td>{content}</td>
                </tr>
            </table>
        </td>
    </tr>;
}

// Board classes.

const cardStyle = {
    'table-layout': 'fixed',
}


const innerCardStyle = {
    'table-layout': 'fixed',
    'word-wrap': 'break-word;',
    border: '1px solid #555',
    // lineHeight: '14px',
}

const cardnameStyle = {
    display: 'inline-block',
    float: 'left',
    'text-align': 'left',
    'font-size': '14px',
}

const dogmaStyle = {
    'font-size': '11px',
}

const ageStyle = {
    display: 'inline-block',
    float: 'right',
    'text-align': 'right',
    'font-size': '14px',
}

const splayShort = {
    '': '',
    'up': 'u',
    'left': 'l',
    'right': 'r',
}

function renderPile(pile, splay, onClick) {
    if (pile.length === 0) {
        return <div></div>;
    }
    if (splay === "") {
        return <div class="container-unsplayed">{renderCard(pile[pile.length - 1], styleTop(1), onClick)}</div>;
    }
    if (splay === "left") {
        let cards = pile.flatMap((card, index) => renderCard(card, styleRight(pile.length - index), onClick));
        return <div style={containerHorizontal(pile.length)}>{cards}</div>;
    }
    if (splay === "right") {
        let cards = pile.flatMap((card, index) => renderCard(card, styleRight(index + 1), onClick));
        return <div style={containerHorizontal(pile.length)}>{cards}</div>;
    }
    if (splay === "up") {
        let cards = pile.flatMap((card, index) => renderCard(card, styleUp(pile.length - index), onClick));
        return <div style={containerVertical(pile.length)}>{cards}</div>;
    }
}


function renderCard(card, style, onClick) {
    let itemClasses = ["item", card.color];
    let dogmas = [];
    card.dogmasEnglish.forEach(txt => dogmas.push(<div class="dogma">
        <img
            src={symbolImages[card.mainSymbol]}
            width="16"
            height="16"
        />: {txt}
    </div>));
    return <div class={itemClasses.join(" ")} style={style} onClick={onClick === null ? "" : () => onClick(card.id)}>
        <div class="card-inner">
            <div class="symbol symbol1">
                <img
                    src={symbolImages[card.symbols[0]]}
                    width="80"
                    height="80"
                />
            </div>
            <div class="card-text">
                <div class="card-typeline"><span class="card-name">{card.name}</span>
                    <div class="card-age">{card.age}</div>
                </div>
                <div>{dogmas}</div>
            </div>
            <div class="symbol symbol4">
                <img
                    src={symbolImages[card.symbols[3]]}
                    width="80"
                    height="80"
                />
            </div>
            <div class="symbol symbol5">
                <img
                    src={symbolImages[card.symbols[4]]}
                    width="80"
                    height="80"
                />
            </div>
            <div class="symbol symbol6">
                <img
                    src={symbolImages[card.symbols[5]]}
                    width="80"
                    height="80"
                />
            </div>
        </div>
    </div>;
}

function renderBoard(board, msg, onClick, symbolsRendered) {
    return <tr>
        <td style={cellStyleSide('clear', false)}>{msg}{symbolsRendered}</td>
        <td colspan="5" >{renderBoard2(board, onClick)}</td>
        </tr>;
}

function renderCardOld(top, extra) {
    let inPlaySymbolSize = '72';
    let dogmaSymbolSize = '16';
    let innerTdata = [];
    innerTdata.push(<tr height="20">
        <td colSpan='2'>
            <b style={cardnameStyle}>{top.name}</b>
        </td>
        <td>
            <b style={ageStyle}>{top.age}{extra}</b>
        </td>
    </tr>);
    top.dogmasEnglish.forEach(txt => innerTdata.push(<tr height="20">
        <td colSpan='3' height="20">
            <p style={dogmaStyle}><img src={symbolImages[top.mainSymbol]} width={dogmaSymbolSize}
                                       height={dogmaSymbolSize}/> :{txt}</p>
        </td>
    </tr>));

    return <table style={cardStyle} width="300">
        <tr>
            <td>
                <img src={symbolImages[top.symbols[0]]} width={inPlaySymbolSize} height={inPlaySymbolSize}/>
            </td>
            <td colspan='2'>
                <table height="60" width="172" style={innerCardStyle}>
                    {innerTdata}
                </table>
            </td>
        </tr>
        <tr>
            <td>
                <img src={symbolImages[top.symbols[3]]} width={inPlaySymbolSize} height={inPlaySymbolSize}/>
            </td>
            <td>
                <img src={symbolImages[top.symbols[4]]} width={inPlaySymbolSize} height={inPlaySymbolSize}/>
            </td>
            <td>
                <img src={symbolImages[top.symbols[5]]} width={inPlaySymbolSize} height={inPlaySymbolSize}/>
            </td>
        </tr>
    </table>
}

function renderBoard2(board, onClick) {
    return <div class="container-flex">
        {renderPile(board["yellow"], board.splay["yellow"], onClick)}
        {renderPile(board["blue"], board.splay["blue"], onClick)}
        {renderPile(board["purple"], board.splay["purple"], onClick)}
        {renderPile(board["red"], board.splay["red"], onClick)}
        {renderPile(board["green"], board.splay["green"], onClick)}
    </div>
}

function renderHand(hand, onClick) {
    let output = hand.flatMap(c => renderPile([c], "", onClick));
    return <div class="container-flex">
        {output}
    </div>
}

function renderSymbols(counts) {
    let output = [];
    symbols.forEach(s => {
        output.push(<span><img src={symbolImages[s]} width="16" height="16"/>:{counts[s].toString()} </span>);
    })
    return <div>{output}</div>
}

function containerHorizontal(numCards) {
    let numRepeat = numCards + 2;
    return {
        display: 'grid',
        'grid-template-columns': 'repeat(' + numRepeat.toString() + ', 100px)',
        'grid-template-rows': 'repeat(2, 100px)',
        padding: '2px',
    };
}

function containerVertical(numCards) {
    let numRepeat = numCards + 1;
    return {
        display: 'grid',
        'grid-template-rows': 'repeat(' + numRepeat.toString() + ', 100px)',
        'grid-template-columns': 'repeat(3, 100px)',
        padding: '2px',
    };
}

function styleRight(idx) {
    let denominatorIdx = idx + 3;
    return {
        'grid-column': idx.toString() + ' / ' + denominatorIdx.toString(),
        'grid-row': '1 / 3',
    };
}

function styleUp(idx) {
    let denominatorIdx = idx + 2;
    return {
        'grid-row': idx.toString() + ' / ' + denominatorIdx.toString(),
        'grid-column': '1 / 4',
    };
}

function styleTop(idx) {
    return styleUp(1);
}