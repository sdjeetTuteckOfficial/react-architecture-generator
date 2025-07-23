import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Key, Link, Check } from 'lucide-react';

const DB_FIELD_TYPES = [
  'VARCHAR',
  'INT',
  'BIGINT',
  'SMALLINT',
  'DECIMAL',
  'FLOAT',
  'DOUBLE',
  'BOOLEAN',
  'DATE',
  'TIME',
  'DATETIME',
  'TIMESTAMP',
  'TEXT',
  'BLOB',
  'JSON',
  'UUID',
  'ENUM',
];

const DbTableEditor = ({ isOpen, node, onClose, onUpdate, onDelete }) => {
  const [tableName, setTableName] = useState('');
  const [fields, setFields] = useState([]);

  // Initialize form data when node changes
  useEffect(() => {
    if (node && node.type === 'dbTableNode') {
      setTableName(node.data.label || '');
      // Ensure each field has a unique ID if it doesn't already have one
      const fieldsWithIds = (node.data.fields || []).map((field, index) => ({
        ...field,
        id:
          field.id ||
          `field_${Date.now()}_${index}_${Math.random()
            .toString(36)
            .substr(2, 9)}`,
      }));
      setFields(fieldsWithIds);
    }
  }, [node]);

  // Add a new field
  const addField = () => {
    const newField = {
      id: `field_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: '',
      type: 'VARCHAR',
      nullable: true,
      primaryKey: false,
      foreignKey: false,
      unique: false,
      defaultValue: '',
      length: '',
    };
    setFields((prev) => [...prev, newField]);
  };

  // Update a field
  const updateField = (fieldId, updates) => {
    setFields((prev) =>
      prev.map((field) => {
        if (field.id === fieldId) {
          return { ...field, ...updates };
        }
        return field;
      })
    );
  };

  // Delete a field
  const deleteField = (fieldId) => {
    setFields((prev) => prev.filter((field) => field.id !== fieldId));
  };

  // Handle save
  const handleSave = () => {
    const updatedNode = {
      ...node,
      data: {
        ...node.data,
        label: tableName,
        fields: fields,
      },
    };

    onUpdate(updatedNode);
    onClose(); // Close the modal after saving
  };

  // Handle delete
  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this table?')) {
      onDelete(node.id);
      onClose(); // Close the modal after deleting
    }
  };

  if (!isOpen || !node || node.type !== 'dbTableNode') {
    return null;
  }

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm'>
      <div className='bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden mx-4'>
        {/* Header */}
        <div className='px-5 py-4 border-b border-gray-100 relative'>
          <h2 className='text-lg font-semibold text-gray-800 pr-8'>
            Edit Database Table
          </h2>
          <button
            onClick={onClose}
            className='absolute top-4 right-4 w-6 h-6 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all'
            title='Close'
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className='p-5 overflow-y-auto max-h-[calc(90vh-140px)]'>
          {/* Table Name */}
          <div className='mb-4'>
            <label className='block text-xs font-medium text-gray-600 mb-1'>
              Table Name
            </label>
            <input
              type='text'
              value={tableName}
              onChange={(e) => setTableName(e.target.value)}
              className='w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all'
              placeholder='Enter table name'
            />
          </div>

          {/* Fields Section */}
          <div className='mb-6'>
            <div className='flex items-center justify-between mb-3'>
              <h3 className='text-md font-medium text-gray-800'>Fields</h3>
              <button
                onClick={addField}
                className='flex items-center px-3 py-1.5 text-xs bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors shadow-sm'
              >
                <Plus size={14} className='mr-1' />
                Add Field
              </button>
            </div>

            {/* Fields List */}
            <div className='space-y-3'>
              {fields.map((field) => (
                <div
                  key={field.id}
                  className='p-4 border border-gray-100 rounded-lg bg-gray-50'
                >
                  <div className='grid grid-cols-1 md:grid-cols-3 gap-3'>
                    {/* Field Name */}
                    <div>
                      <label className='block text-xs font-medium text-gray-600 mb-1'>
                        Field Name
                      </label>
                      <input
                        type='text'
                        value={field.name}
                        onChange={(e) =>
                          updateField(field.id, { name: e.target.value })
                        }
                        className='w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all'
                        placeholder='field_name'
                      />
                    </div>

                    {/* Field Type */}
                    <div>
                      <label className='block text-xs font-medium text-gray-600 mb-1'>
                        Data Type
                      </label>
                      <select
                        value={field.type}
                        onChange={(e) =>
                          updateField(field.id, { type: e.target.value })
                        }
                        className='w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all'
                      >
                        {DB_FIELD_TYPES.map((type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Length/Size */}
                    <div>
                      <label className='block text-xs font-medium text-gray-600 mb-1'>
                        Length (optional)
                      </label>
                      <input
                        type='text'
                        value={field.length}
                        onChange={(e) =>
                          updateField(field.id, { length: e.target.value })
                        }
                        className='w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all'
                        placeholder='255'
                      />
                    </div>
                  </div>

                  {/* Field Options */}
                  <div className='flex flex-wrap items-center gap-x-4 gap-y-2 mt-3'>
                    <label className='flex items-center text-sm text-gray-700'>
                      <input
                        type='checkbox'
                        checked={field.primaryKey}
                        onChange={(e) =>
                          updateField(field.id, {
                            primaryKey: e.target.checked,
                          })
                        }
                        className='mr-1 accent-blue-500'
                      />
                      <Key size={14} className='mr-1 text-yellow-600' />
                      Primary Key
                    </label>

                    <label className='flex items-center text-sm text-gray-700'>
                      <input
                        type='checkbox'
                        checked={field.foreignKey}
                        onChange={(e) =>
                          updateField(field.id, {
                            foreignKey: e.target.checked,
                          })
                        }
                        className='mr-1 accent-blue-500'
                      />
                      <Link size={14} className='mr-1 text-green-600' />
                      Foreign Key
                    </label>

                    <label className='flex items-center text-sm text-gray-700'>
                      <input
                        type='checkbox'
                        checked={field.unique}
                        onChange={(e) =>
                          updateField(field.id, { unique: e.target.checked })
                        }
                        className='mr-1 accent-blue-500'
                      />
                      <Check size={14} className='mr-1 text-blue-600' />
                      Unique
                    </label>

                    <label className='flex items-center text-sm text-gray-700'>
                      <input
                        type='checkbox'
                        checked={field.nullable}
                        onChange={(e) =>
                          updateField(field.id, { nullable: e.target.checked })
                        }
                        className='mr-1 accent-blue-500'
                      />
                      Nullable
                    </label>

                    {/* Delete Field Button */}
                    <button
                      onClick={() => deleteField(field.id)}
                      className='ml-auto p-1 text-red-500 hover:text-red-600 transition-colors rounded-full hover:bg-red-50'
                      title='Delete field'
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  {/* Default Value */}
                  <div className='mt-3'>
                    <label className='block text-xs font-medium text-gray-600 mb-1'>
                      Default Value (optional)
                    </label>
                    <input
                      type='text'
                      value={field.defaultValue}
                      onChange={(e) =>
                        updateField(field.id, { defaultValue: e.target.value })
                      }
                      className='w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all'
                      placeholder="NULL, 0, 'default', etc."
                    />
                  </div>
                </div>
              ))}

              {fields.length === 0 && (
                <div className='text-center py-6 text-gray-500 text-sm'>
                  <p>No fields defined. Click "Add Field" to get started.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className='px-5 py-3 border-t border-gray-100 bg-gray-50 rounded-b-xl'>
          <div className='flex justify-between items-center'>
            {/* Delete Button */}
            <button
              onClick={handleDelete}
              className='px-3 py-1.5 text-xs bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors shadow-sm'
            >
              Delete Table
            </button>

            {/* Action Buttons */}
            <div className='flex gap-2'>
              <button
                onClick={onClose}
                className='px-3 py-1.5 text-xs bg-white text-gray-600 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200'
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className='px-3 py-1.5 text-xs bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed'
                disabled={!tableName.trim()}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DbTableEditor;
