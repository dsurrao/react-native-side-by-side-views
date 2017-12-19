import React, { Component } from 'react';
import { Dimensions, Image, PanResponder, StyleSheet, Text, TouchableHighlight,
  View } from 'react-native';

export default class SideBySide extends Component {
  _dividerHeight = 35;
  _dividerWidth = 35;
  _dividerOpacity = 0.5;
  _dividerTop = 0;
  _dividerLeft = 0;
  _dividerLeftStart = 0;
  _leftViewWidth = 0;
  _leftViewWidthStart = 0;
  _rightViewWidth = 0;
  _rightViewWidthStart = 0;
  _lastTouchTimestamp = 0;

  componentWillMount() {
    this.resetViewControlDimensions();

    this._panResponder = PanResponder.create({
      // Ask to be the responder:
      onStartShouldSetPanResponder: (evt, gestureState) => true,
      onStartShouldSetPanResponderCapture: (evt, gestureState) => true,
      onMoveShouldSetPanResponder: (evt, gestureState) => true,
      onMoveShouldSetPanResponderCapture: (evt, gestureState) => true,

      onPanResponderGrant: (evt, gestureState) => {
        if (this._lastTouchTimestamp == 0) {
          this._lastTouchTimestamp = evt.nativeEvent.timestamp;
        }
        else if ((evt.nativeEvent.timestamp - this._lastTouchTimestamp) < 500){
          // this was a double tap if time between taps was less than 500ms
          this.resetView();
        }
        this._lastTouchTimestamp = evt.nativeEvent.timestamp;

        // The gesture has started. Show visual feedback so the user knows
        // what is happening!
        this._dividerLeftStart = this._dividerLeft;
        this._leftViewWidthStart = this._leftViewWidth;
        this._rightViewWidthStart = this._rightViewWidth;
      },
      onPanResponderMove: (evt, gestureState) => {
        // The most recent move distance is gestureState.move{X,Y}

        // The accumulated gesture distance since becoming responder is
        // gestureState.d{x,y}
        this._dividerLeft = this._dividerLeftStart + gestureState.dx;
        this.divider.setNativeProps({left: this._dividerLeft});
        this._leftViewWidth = this._leftViewWidthStart + gestureState.dx;
        this._rightViewWidth = this._rightViewWidthStart - gestureState.dx;
        this.leftView.setNativeProps({flex:
            (this._leftViewWidthStart + gestureState.dx)/
            (this._rightViewWidthStart - gestureState.dx)
          }
        );
      },
      onPanResponderTerminationRequest: (evt, gestureState) => true,
      onPanResponderRelease: (evt, gestureState) => {
      },
      onPanResponderTerminate: (evt, gestureState) => {
        // Another component has become the responder, so this gesture
        // should be cancelled
      },
      onShouldBlockNativeResponder: (evt, gestureState) => {
        // Returns whether this component should block native components from
        // becoming the JS responder. Returns true by default. Is currently
        // only supported on android.
        return true;
      },
    });
  }

  componentDidMount() {
    Dimensions.addEventListener("change", this.orientationChanged.bind(this));
  }

  componentWillUnmount() {
    Dimensions.removeEventListener("change", this.orientationChanged);
  }

  orientationChanged(evt) {
    this.resetView();
  }

  resetView() {
    this.resetViewControlDimensions();
    this.divider.setNativeProps(
      {left: this._dividerLeft, top: this._dividerTop});
    this.leftView.setNativeProps({flex: 1});
  }

  resetViewControlDimensions() {
    let deviceHeight = Dimensions.get('window').height;
    let deviceWidth = Dimensions.get('window').width;
    this._leftViewWidth = deviceWidth/2;
    this._rightViewWidth = deviceWidth/2;
    this._dividerLeft = deviceWidth/2 - this._dividerWidth/2;
    this._dividerTop = deviceHeight/2;
  }

  renderChildren() {
    this._children = React.Children.map(this.props.children,
     (child, index) => {
       if (index == 0) {
        return React.cloneElement(child,
          { style: {flex: 1, padding: 1},
            ref: (thisView) => {this.leftView = thisView;}
          }
        );
       }
       else {
         return React.cloneElement(child, {style:
           {flex: 1, padding: 1}});
       }
     });
    return this._children;
  }

  render() {
    return (
      <View style={ [styles.container, this.props.style] }>
        {this.renderChildren()}
        <View ref={(divider) => {this.divider = divider;}}
          style={[{position: 'absolute',
            top: this._dividerTop,
            left: this._dividerLeft,
            height: this._dividerHeight,
            width: this._dividerWidth,
            opacity: this._dividerOpacity},
            styles.divider]}
            {...this._panResponder.panHandlers}>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center'
  },
  divider: {
    backgroundColor: 'blue',
    borderRadius: 35
  }
});

export { SideBySide };
