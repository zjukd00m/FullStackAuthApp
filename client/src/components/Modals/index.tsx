import { useState } from "react";
import "./styles.css";

interface ModalProps {
    visible: boolean;
    title: string;
    subtitle: string;
    body: JSX.Element;
}

export default function Modal(props: ModalProps) {
    const { visible, title, subtitle, body } = props;

    if (!visible) return null;    

    return (
        <div className="modal-container">
            <div className="modal">
                <p className="modal-title"> { title } </p>
                <p className="modal-subtitle"> { subtitle } </p>
                <div className="modal-body">
                    { body }
                </div>
            </div>
        </div>
    )
}
