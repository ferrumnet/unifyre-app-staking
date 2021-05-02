import React, { Component } from "react";

export default class ButtonLoader extends Component<{onPress: ()=> void,disabled:boolean}> {
  state = {
    loading: false
  };

  render() {
    const { loading } = this.state;

    return (
      <div style={{ marginTop: "10px",textAlign:'start',paddingLeft: '7%' }}>
        <button className="buttonwithloader" onClick={()=>this.props.onPress()} disabled={loading||this.props.disabled}>
          {loading && (
            <i
              className="fa fa-refresh fa-spin"
              style={{ marginRight: "5px" }}
            />
          )}
          {loading && <span>Withdrawing Item</span>}
          {!loading && this.props.disabled ? <span>Withdrawal processing</span> : <span>Withdraw Item</span>}
        </button>
      </div>
    );
  }
}