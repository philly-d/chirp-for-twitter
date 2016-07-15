import React, { Component, PropTypes } from 'react';
import Draggable from '@bokuweb/react-draggable-custom';
import Resizable from 'react-resizable-box';

// Patched version of @bokuweb's react-resizable-and-movable library:
// https://github.com/bokuweb/react-resizable-and-movable.
// TODO: Make a proper fork
export default class ResizableAndMovable extends Component {
  static propTypes = {
    initAsResizing: PropTypes.object,
    onResizeStart: PropTypes.func,
    onResize: PropTypes.func,
    onResizeStop: PropTypes.func,
    onDragStart: PropTypes.func,
    onDrag: PropTypes.func,
    onDragStop: PropTypes.func,
    className: PropTypes.string,
    style: PropTypes.object,
    children: PropTypes.any,
    onTouchStart: PropTypes.func,
    onClick: PropTypes.func,
    onDoubleClick: PropTypes.func,
    dragHandlerClassName: PropTypes.string,
    resizerHandleStyle: PropTypes.shape({
      top: PropTypes.object,
      right: PropTypes.object,
      bottom: PropTypes.object,
      left: PropTypes.object,
      topRight: PropTypes.object,
      bottomRight: PropTypes.object,
      bottomLeft: PropTypes.object,
      topLeft: PropTypes.object,
    }),
    isResizable: PropTypes.shape({
      top: PropTypes.bool,
      right: PropTypes.bool,
      bottom: PropTypes.bool,
      left: PropTypes.bool,
      topRight: PropTypes.bool,
      bottomRight: PropTypes.bool,
      bottomLeft: PropTypes.bool,
      topLeft: PropTypes.bool,
    }),
    canUpdateSizeByParent: PropTypes.bool,
    width: PropTypes.oneOfType([
      PropTypes.number,
      PropTypes.string,
    ]),
    height: PropTypes.oneOfType([
      PropTypes.number,
      PropTypes.string,
    ]),
    minWidth: PropTypes.number,
    minHeight: PropTypes.number,
    maxWidth: PropTypes.number,
    maxHeight: PropTypes.number,
    moveAxis: PropTypes.oneOf(['x', 'y', 'both', 'none']),
    moveGrid: PropTypes.arrayOf(PropTypes.number),
    resizeGrid: PropTypes.arrayOf(PropTypes.number),
    bounds: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.object,
    ]),
    x: PropTypes.number,
    y: PropTypes.number,
    zIndex: PropTypes.number,
  };

  static defaultProps = {
    x: 0,
    y: 0,
    width: 100,
    height: 100,
    zIndex: 100,
    className: '',
    dragHandlerClassName: '',
    initAsResizing: { enable: false, direction: 'bottomRight' },
    isResizable: {
      top: true,
      right: true,
      bottom: true,
      left: true,
      topRight: true,
      bottomRight: true,
      bottomLeft: true,
      topLeft: true,
    },
    canUpdateSizeByParent: false,
    style: {},
    moveAxis: 'both',
    moveGrid: [1, 1],
    onClick: () => {},
    onTouchStart: () => {},
    onDragStart: () => {},
    onDrag: () => {},
    onDragStop: () => {},
    onResizeStart: () => {},
    onResize: () => {},
    onResizeStop: () => {},
    resizeGrid: [1, 1],
  }

  constructor(props) {
    super(props);
    this.state = {
      isDraggable: true,
      x: props.x,
      y: props.y,
      original: { x: props.x, y: props.y },
    };
    this.isResizing = false;
    this.onDragStart = this.onDragStart.bind(this);
    this.onDrag = this.onDrag.bind(this);
    this.onDragStop = this.onDragStop.bind(this);
    this.onResizeStart = this.onResizeStart.bind(this);
    this.onResize = this.onResize.bind(this);
    this.onResizeStop = this.onResizeStop.bind(this);
  }

  componentDidMount() {
    const { initAsResizing: { enable, direction, event } } = this.props;
    if (enable) this.refs.resizable.onResizeStart(direction, event);
  }

  componentWillReceiveProps({ x, y }) {
    if (x !== this.state.x) this.setState({ x });
    if (y !== this.state.y) this.setState({ y });
  }

  onResizeStart(dir, styleSize, clientSize, e) {
    this.setState({
      isDraggable: false,
      original: { x: this.state.x, y: this.state.y },
    });
    this.isResizing = true;
    this.props.onResizeStart(dir, styleSize, clientSize, e);
    e.stopPropagation();
  }

  onResize(dir, styleSize, clientSize, delta) {
    if (/left/i.test(dir)) {
      this.setState({ x: this.state.original.x - delta.width });
    }
    if (/top/i.test(dir)) {
      this.setState({ y: this.state.original.y - delta.height });
    }
    this.props.onResize(dir, styleSize, clientSize, delta);
  }

  onResizeStop(dir, styleSize, clientSize, delta) {
    this.setState({ isDraggable: true });
    this.isResizing = false;
    this.props.onResizeStop(dir, styleSize, clientSize, delta);
  }

  onDragStart(e, ui) {
    if (this.isResizing) return;
    this.props.onDragStart(e, ui);
  }

  onDrag(e, ui) {
    if (this.isResizing) return;
    const allowX = this.props.moveAxis === 'x';
    const allowY = this.props.moveAxis === 'y';
    const allowBoth = this.props.moveAxis === 'both';
    this.setState({
      x: allowX || allowBoth ? ui.position.left : this.state.x,
      y: allowY || allowBoth ? ui.position.top : this.state.y,
    });
    this.props.onDrag(e, ui);
  }

  onDragStop(e, ui) {
    if (this.isResizing) return;
    this.props.onDragStop(e, ui);
  }

  render() {
    const { className, style, onClick, onTouchStart,
            width, height, minWidth, minHeight, maxWidth, maxHeight,
            zIndex, bounds, moveAxis, dragHandlerClassName,
            moveGrid, resizeGrid, onDoubleClick, canUpdateSizeByParent } = this.props;
    const { x, y } = this.state;
    // Patching styles
    const boxStyle = {
      cursor: 'move',
      position: 'fixed',
      left: 0,
      top: 0,
      zIndex: zIndex,
    }
    return (
      <Draggable
        enableUserSelectHack={false} // Patch so user doesn't lose selection
        axis={moveAxis}
        zIndex={zIndex}
        start={{ x, y }}
        disabled={!this.state.isDraggable || this.props.moveAxis === 'none'}
        onStart={this.onDragStart}
        handle={dragHandlerClassName}
        onDrag={this.onDrag}
        onStop={this.onDragStop}
        bounds={bounds}
        grid={moveGrid}
        passCoordinate
        x={x}
        y={y}
      >
        <div style={boxStyle}>
          <Resizable
            enableUserSelectHack={false}
            ref="resizable"
            onClick={onClick}
            onDoubleClick={onDoubleClick}
            onTouchStart={onTouchStart}
            onResizeStart={this.onResizeStart}
            onResize={this.onResize}
            onResizeStop={this.onResizeStop}
            width={canUpdateSizeByParent ? width : '100%'}
            height={canUpdateSizeByParent ? height : '100%'}
            minWidth={minWidth}
            minHeight={minHeight}
            maxWidth={maxWidth}
            maxHeight={maxHeight}
            customStyle={style}
            customClass={className}
            isResizable={this.props.isResizable}
            handleStyle={this.props.resizerHandleStyle}
            grid={resizeGrid}
          >
            {this.props.children}
          </Resizable>
        </div>
      </Draggable>
    );
  }
}