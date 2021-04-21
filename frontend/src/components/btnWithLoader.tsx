import React, { Component } from "react";

export default class ButtonLoader extends Component<{onPress: ()=> void}> {
  state = {
    loading: false
  };

  fetchData = () => {
    this.setState({ loading: true });

    //Faking API call here
    setTimeout(() => {
      this.setState({ loading: false });
    }, 2000);
  };

  render() {
    const { loading } = this.state;

    return (
      <div style={{ marginTop: "10px",textAlign:'start',paddingLeft: '7%' }}>
        <button className="buttonwithloader" onClick={()=>this.props.onPress()} disabled={loading}>
          {loading && (
            <i
              className="fa fa-refresh fa-spin"
              style={{ marginRight: "5px" }}
            />
          )}
          {loading && <span>Withdrawing Item</span>}
          {!loading && <span>Withdraw Item</span>}
        </button>
      </div>
    );
  }
}