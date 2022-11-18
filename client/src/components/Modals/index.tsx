import "./styles.css";

interface ModalProps {
    visible: boolean;
    title: string;
    subtitle: string;
    body: JSX.Element;
}

export default function Modal(props: ModalProps) {
    const { visible, title, subtitle, body } = props;

    console.log({
        visible,
        title,
        subtitle,
        body,
    });

    if (!visible) return null;    

    return (
        <div className="modal d-block" tabIndex={-1}>
            <div className="modal-dialog">
                <div className="modal-content">
                    <div className="modal-header">
                        <p className="modal-title"> { title } </p>
                    </div>
                    <div className="modal-body">
                        { body }
                    </div>
                </div>
            </div>
        </div>
    )
}
