import React from 'react';
import './AttachmentSequence.css';

const AttachmentSequence = ({ months, sequence, onSequenceChange }) => {
  const handleDragStart = (e, index) => {
    e.dataTransfer.setData('text/plain', index);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, targetIndex) => {
    e.preventDefault();
    const sourceIndex = parseInt(e.dataTransfer.getData('text/plain'));
    const newSequence = [...sequence];
    const [movedItem] = newSequence.splice(sourceIndex, 1);
    newSequence.splice(targetIndex, 0, movedItem);
    onSequenceChange(newSequence);
  };

  return (
    <div className="attachment-sequence">
      <h3>Attachment Order</h3>
      <p className="help-text">Drag and drop to reorder attachments</p>
      <ul className="sequence-list">
        {sequence.map((item, index) => (
          <li
            key={`${item.month}-${item.year}`}
            className="sequence-item"
            draggable
            onDragStart={(e) => handleDragStart(e, index)}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, index)}
          >
            <span className="sequence-number">{index + 1}</span>
            <span className="sequence-month">{item.month} {item.year}</span>
            <span className="drag-handle">⋮⋮</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AttachmentSequence; 