import { Button, Modal } from "flowbite-react";

const ConfirmModal = ({
  show,
  onClose,
  onConfirm,
  title,
  bodyText,
  confirmButtonText = "Ja",
  cancelButtonText = "Abbrechen",
}) => {
  return (
    <Modal show={show} onClose={onClose} size="lg">
      <Modal.Header className="flex justify-between items-center">
        <span className="text-lg font-semibold text-gray-900">{title}</span>
        <button
          onClick={onClose}
          className="text-gray-600 hover:text-gray-900"
        ></button>
      </Modal.Header>
      <Modal.Body className="text-[#6B7280]">
        <p>{bodyText}</p>
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={onConfirm} className="bg-primary">
          {confirmButtonText}
        </Button>
        <Button color="gray" onClick={onClose}>
          {cancelButtonText}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};
export default ConfirmModal;
