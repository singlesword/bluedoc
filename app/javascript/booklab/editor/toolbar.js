import { BarButton } from "./bar-button"
import styled from "styled-components";
import LinkToolbar from "rich-md-editor/lib/components/Toolbar/LinkToolbar"
import getDataTransferFiles from "rich-md-editor/lib/lib/getDataTransferFiles"
import { insertImageFile } from "rich-md-editor/lib/changes"

function getLinkInSelection(value) {
  try {
    const selectedLinks = value.document
      .getInlinesAtRange(value.selection)
      .filter(node => node.type === "link");

    if (selectedLinks.size) {
      const link = selectedLinks.first();
      if (value.selection.hasEdgeIn(link)) return link;
    }
  } catch (err) {
    // It's okay.
  }
}

export class Toolbar extends React.Component {
  state = {
    link: undefined
  }

  hasMark = (type) => {
    try {
      return this.props.editor.value.marks.some(mark => mark.type === type);
    } catch (_err) {
      return false;
    }
  }

  isBlock = (type) => {
    const startBlock = this.props.editor.value.startBlock;
    return startBlock && startBlock.type === type;
  }

  /**
   * When a mark button is clicked, toggle the current mark.
   *
   * @param {Event} ev
   * @param {String} type
   */
  onClickMark = (ev, type) => {
    ev.preventDefault();
    ev.stopPropagation();

    this.props.editor.change(change => {
      change.toggleMark(type);

      // ensure we remove any other marks on inline code
      // we don't allow bold / italic / strikethrough code.
      const isInlineCode = this.hasMark("code") || type === "code";
      if (isInlineCode) {
        change.value.marks.forEach(mark => {
          if (mark.type !== "code") change.removeMark(mark);
        });
      }
    });
  };

  onClickBlock = (ev, type) => {
    ev.preventDefault();
    ev.stopPropagation();

    this.props.editor.change(change => change.setBlocks(type));
  };

  handleCreateLink = (ev) => {
    ev.preventDefault();
    ev.stopPropagation();

    const data = { href: "" };
    this.props.editor.change(change => {
      change.wrapInline({ type: "link", data });
      this.showLinkToolbar(ev);
    });
  };

  showLinkToolbar = (ev) => {
    ev.preventDefault();
    ev.stopPropagation();

    const link = getLinkInSelection(this.props.value);
    this.setState({ link: link })
  }

  hideLinkToolbar = () => {
    this.setState({ link: undefined })
  }

  handleImageClick = () => {
    // simulate a click on the file upload input element
    this.file.click();
  }

  onImagePicked = async (ev) => {
    const files = getDataTransferFiles(ev);
    const { editor } = this.props;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      editor.change(change => change.call(insertImageFile, file, editor));
    }
  }

  renderMarkButton = (type, icon) => {
    const isActive = this.hasMark(type);
    const onMouseDown = ev => this.onClickMark(ev, type);

    return (
      <BarButton icon={icon} title={type} active={isActive} onMouseDown={onMouseDown} />
    );
  }

  renderBlockButton = (type, icon) => {
    const isActive = this.isBlock(type);
    const onMouseDown = ev =>
      this.onClickBlock(ev, isActive ? "paragraph" : type);

    return (
      <BarButton icon={icon} title={type} active={isActive} onMouseDown={onMouseDown} />
    );
  }

  render() {
    return <div className="editor-toolbar">
      <div className="container">
        <HiddenInput
          type="file"
          innerRef={ref => (this.file = ref)}
          onChange={this.onImagePicked}
          accept="image/*"
        />
        {this.renderMarkButton("bold", "format_bold")}
        {this.renderMarkButton("italic", "format_italic")}
        {this.renderMarkButton("deleted", "format_strikethrough")}
        {this.renderMarkButton("underlined", "format_underlined")}
        <span className="bar-divider"></span>
        {this.renderBlockButton("bulleted-list", "format_list_bulleted")}
        {this.renderBlockButton("ordered-list", "format_list_numbered")}
        <span className="bar-divider"></span>
        {this.renderBlockButton("block-quote", "quote")}
        {this.renderBlockButton("code", "code")}
        {this.renderBlockButton("horizontal-rule", "drag_handle")}
        <span className="bar-divider"></span>
        <BarButton icon="insert_link" onMouseDown={this.handleCreateLink} />
        <BarButton icon="insert_photo" onMouseDown={this.handleImageClick} />
      </div>
      {this.state.link && (
        <LinkToolbar link={this.state.link} onBlur={this.hideLinkToolbar} />
      )}
    </div>
  }
}

const HiddenInput = styled.input`display: none;`;