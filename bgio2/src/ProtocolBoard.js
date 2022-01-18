import React from 'react';
import {facedownCardStyle} from "./styles";

export class ProtocolBoard extends React.Component {
    render() {

        let style = facedownCardStyle('brown');
        style.border = '1px solid #555';
        style.width = '100px';
        let values = this.props.G.data.map( (e, idx) => <td style={style} onClick={() => this.props.moves.doMove({
            // TODO
            src: idx,
            dst: (idx+1)%5,
        })}>{e}</td>);

        return (
            <div>
                <h3>FE/BE Protocol playground</h3>
                <table>
                    <tr>
                        {values}
                    </tr>
                </table>
            </div>
        );
    }
}