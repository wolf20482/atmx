import { InboxOutlined } from "@ant-design/icons";
import { Button as AntdButton, ButtonProps, Divider, Dropdown, Menu, message, Modal, Space, Upload } from "antd";
import { DraggerProps } from "antd/lib/upload";
import ClipboardJS from "clipboard";
import { saveAs } from 'file-saver';
import { Editor } from "slate";
import { useSlate } from "slate-react";
import { AchievedNode, BlockNode, InlineNode, TextCommand as command, useEditorInfo } from "..";
const { Dragger } = Upload;

const ToolBar: React.FC = props => {
    const { editor } = useEditorInfo();
    command.setEditor(editor);

    new ClipboardJS('#export-copy');

    return (
        <>
            <Space split={<Divider type="vertical" />}>
                {props.children}
            </Space>
        </>
    );
}

export const DefaultButton: React.FC<{ isActive?: boolean } & ButtonProps> = (props) => {
    const { isActive = false, ...buttonProps } = props;
    return (
        <AntdButton
            style={{
                color: isActive ? "#1890ff" : undefined
            }}
            {...buttonProps}>
            {props.children}
        </AntdButton>
    )
}

export const InlineButton: React.FC<{ format: InlineNode & AchievedNode, attr?: Object, isActive?: (editor: Editor) => boolean, icon?: React.ReactNode } & ButtonProps> = (props) => {
    const editor = useSlate();
    const { format, attr, icon, ...buttonProps } = props

    return (
        <AntdButton size='small' type="text" icon={icon} title={format.title}
            style={{
                color: (format.isActive ? format.isActive(editor, attr) : command.isBlockActive(format.key)) ? "#1890ff" : undefined
            }}
            onClick={e => {
                e.preventDefault()
                format.achieve(editor, attr);
}}
{...buttonProps }
        >
    { props.children }
        </AntdButton >
    )
}
export const BlockButton: React.FC<{ format: BlockNode & AchievedNode, attr?: Object, icon?: React.ReactNode } & ButtonProps> = (props) => {
    const editor = useSlate();
    const { format, attr = {}, icon, ...buttonProps } = props;

    return (
        <AntdButton size='small' style={{
            color: (format.isActive ? format.isActive(editor, attr) : command.isBlockActive(format.key)) ? "#1890ff" : undefined
        }}
            type="text"
            icon={icon}
            onClick={e => {
                e.preventDefault();
                format.achieve(editor, attr);
            }}
            {...buttonProps}
        >
            {props.children}
        </AntdButton>
    )
}

export const StartMenu = () => {
    const { editor, initialValue, serialize } = useEditorInfo();
    return <div className='header'>
        <Dropdown.Button size='small' type='ghost' trigger={["hover"]}
            overlay={
                <Menu onClick={
                    ev => {
                        switch (ev.key) {
                            case 'new':
                                Modal.confirm({
                                    title: 'New document',
                                    onOk: () => {
                                        localStorage.removeItem('content');
                                        window.location.reload();
                                    },
                                    content:
                                        <>
                                            Your current text will be erased and cannot be restored, please ensure that the current text has been saved or exported
                                        </>,
                                });
                                break;
                            case 'open':
                                const reader = new FileReader();
                                let file: Blob;
                                reader.onload = (evt) => {
                                    if (!evt.target || typeof evt.target.result !== 'string') return message.error(`Failed to open`);
                                    message.success(`Opened file`);
                                    //editor.children = JSON.parse(evt.target.result) as Descendant[];
                                    localStorage.setItem('content', evt.target.result);
                                    window.location.reload();
                                };
                                const props: DraggerProps = {
                                    name: 'file',
                                    multiple: false,
                                    beforeUpload: (f) => {
                                        file = f;
                                        return false;
                                    }
                                };
                                Modal.confirm({
                                    title: 'Open file',
                                    onOk: () => {
                                        reader.readAsText(file);
                                    },
                                    content:
                                        <>
                                            <Dragger {...props}>
                                                <p className="ant-upload-drag-icon">
                                                    <InboxOutlined />
                                                </p>
                                                <p className="ant-upload-text">Drag and drop or click to upload file</p>
                                                <p className="ant-upload-hint">
                                                The open operation will overwrite your current text, please make sure the current text is saved or exported
                                                </p>
                                            </Dragger>
                                        </>,
                                });
                                break;
                            case 'export':
                                Modal.confirm({
                                    title: 'Export to Wikidot code',
                                    content:
                                        <>
                                            <pre id='export-output' dangerouslySetInnerHTML={{ __html: serialize(editor).serializeAll() }} />
                                            <AntdButton id='export-copy' data-clipboard-action="copy" data-clipboard-target="#export-output">Copy</AntdButton>
                                        </>,
                                });
                                break;
                            case 'save':
                                saveAs(new Blob([JSON.stringify(initialValue)], { type: 'application/json' }), "atmx.json");
                                break;
                            case 'about':
                                Modal.info({
                                    title: 'About this app',
                                    content:
                                        <>
                                            English WYSIWYG Editor for Wikidot code by Wolf20482. Original code by ZreXoc.
                                            This is an experimental app, if you find any bugs, please DM Wolf20482#5951 on Discord or wolf20482 on Wikidot.</>
                                });
                                break;
                        }
                    }
                }>
                    <Menu.Item key='new'>New</Menu.Item>
                    <Menu.Item key='open'>Open</Menu.Item>
                    <Menu.Item key='export'>Export</Menu.Item>
                    <Menu.Item key='save'>Save</Menu.Item>
                    <Menu.Item key='about'>About</Menu.Item>
                </Menu>
            }>File</Dropdown.Button>
    </div>
}
export { ToolBar };
