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
  };

  // Handle delete
  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this table?')) {
      onDelete(node.id);
    }
  };

  if (!isOpen || !node || node.type !== 'dbTableNode') {
    return null;
  }

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50'>
      <div className='bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden'>
        {/* Header */}
        <div className='flex items-center justify-between p-6 border-b'>
          <h2 className='text-xl font-semibold text-gray-900'>
            Edit Database Table
          </h2>
          <button
            onClick={onClose}
            className='text-gray-400 hover:text-gray-600 transition-colors'
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className='p-6 overflow-y-auto max-h-[calc(90vh-140px)]'>
          {/* Table Name */}
          <div className='mb-6'>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              Table Name
            </label>
            <input
              type='text'
              value={tableName}
              onChange={(e) => setTableName(e.target.value)}
              className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
              placeholder='Enter table name'
            />
          </div>

          {/* Fields Section */}
          <div className='mb-6'>
            <div className='flex items-center justify-between mb-4'>
              <h3 className='text-lg font-medium text-gray-900'>Fields</h3>
              <button
                onClick={addField}
                className='flex items-center px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors'
              >
                <Plus size={16} className='mr-1' />
                Add Field
              </button>
            </div>

            {/* Fields List */}
            <div className='space-y-4'>
              {fields.map((field, index) => (
                <div
                  key={field.id}
                  className='p-4 border border-gray-200 rounded-lg'
                >
                  <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                    {/* Field Name */}
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-1'>
                        Field Name
                      </label>
                      <input
                        type='text'
                        value={field.name}
                        onChange={(e) =>
                          updateField(field.id, { name: e.target.value })
                        }
                        className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                        placeholder='field_name'
                      />
                    </div>

                    {/* Field Type */}
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-1'>
                        Data Type
                      </label>
                      <select
                        value={field.type}
                        onChange={(e) =>
                          updateField(field.id, { type: e.target.value })
                        }
                        className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
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
                      <label className='block text-sm font-medium text-gray-700 mb-1'>
                        Length (optional)
                      </label>
                      <input
                        type='text'
                        value={field.length}
                        onChange={(e) =>
                          updateField(field.id, { length: e.target.value })
                        }
                        className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                        placeholder='255'
                      />
                    </div>
                  </div>

                  {/* Field Options */}
                  <div className='flex flex-wrap items-center gap-4 mt-4'>
                    <label className='flex items-center'>
                      <input
                        type='checkbox'
                        checked={field.primaryKey}
                        onChange={(e) =>
                          updateField(field.id, {
                            primaryKey: e.target.checked,
                          })
                        }
                        className='mr-2'
                      />
                      <Key size={16} className='mr-1 text-yellow-600' />
                      <span className='text-sm'>Primary Key</span>
                    </label>

                    <label className='flex items-center'>
                      <input
                        type='checkbox'
                        checked={field.foreignKey}
                        onChange={(e) =>
                          updateField(field.id, {
                            foreignKey: e.target.checked,
                          })
                        }
                        className='mr-2'
                      />
                      <Link size={16} className='mr-1 text-green-600' />
                      <span className='text-sm'>Foreign Key</span>
                    </label>

                    <label className='flex items-center'>
                      <input
                        type='checkbox'
                        checked={field.unique}
                        onChange={(e) =>
                          updateField(field.id, { unique: e.target.checked })
                        }
                        className='mr-2'
                      />
                      <Check size={16} className='mr-1 text-blue-600' />
                      <span className='text-sm'>Unique</span>
                    </label>

                    <label className='flex items-center'>
                      <input
                        type='checkbox'
                        checked={field.nullable}
                        onChange={(e) =>
                          updateField(field.id, { nullable: e.target.checked })
                        }
                        className='mr-2'
                      />
                      <span className='text-sm'>Nullable</span>
                    </label>

                    {/* Delete Field Button */}
                    <button
                      onClick={() => deleteField(field.id)}
                      className='ml-auto p-2 text-red-500 hover:text-red-700 transition-colors'
                      title='Delete field'
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  {/* Default Value */}
                  <div className='mt-3'>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                      Default Value (optional)
                    </label>
                    <input
                      type='text'
                      value={field.defaultValue}
                      onChange={(e) =>
                        updateField(field.id, { defaultValue: e.target.value })
                      }
                      className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                      placeholder="NULL, 0, 'default', etc."
                    />
                  </div>
                </div>
              ))}

              {fields.length === 0 && (
                <div className='text-center py-8 text-gray-500'>
                  <p>No fields defined. Click "Add Field" to get started.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className='flex items-center justify-between p-6 border-t bg-gray-50'>
          <button
            onClick={handleDelete}
            className='px-4 py-2 text-red-600 hover:text-red-800 transition-colors'
          >
            Delete Table
          </button>
          <div className='flex space-x-3'>
            <button
              onClick={onClose}
              className='px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors'
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className='px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors'
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DbTableEditor;
