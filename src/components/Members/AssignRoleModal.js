import React, { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { motion, AnimatePresence } from 'framer-motion'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { assignRole } from '../../store/slices/membersSlice'
import { closeModal } from '../../store/slices/uiSlice'

const AssignRoleModal = ({ position, department = null }) => {
    const dispatch = useDispatch()
    const { contract: dao } = useSelector((state) => state.dao)
    const { loading } = useSelector((state) => state.members)

    const [formData, setFormData] = useState({
        name: '',
        address: '',
        role: position,
        department: department
    })

    const validateForm = () => {
        const errors = {}
        
        if (!formData.name.trim()) {
            errors.name = 'Name is required'
        } else if (formData.name.length < 2) {
            errors.name = 'Name must be at least 2 characters'
        }
        
        if (!formData.address.trim()) {
            errors.address = 'Address is required'
        } else if (!/^0x[a-fA-F0-9]{40}$/.test(formData.address)) {
            errors.address = 'Invalid Ethereum address'
        }
        
        return errors
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        const errors = validateForm()
        if (Object.keys(errors).length > 0) {
            setFormErrors(errors)
            return
        }

        if (dao && formData.name && formData.address) {
            try {
                await dispatch(assignRole({
                    dao,
                    name: formData.name,
                    address: formData.address,
                    role: formData.role,
                    department: formData.department
                })).unwrap()

                dispatch(closeModal('assignRole'))
            } catch (error) {
                console.error('Error assigning role:', error)
            }
        }
    }

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        })
    }

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 overflow-y-auto">
                <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
                        onClick={() => dispatch(closeModal('assignRole'))}
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative z-10 inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white dark:bg-gray-800 shadow-xl rounded-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                Assign {position} Role
                            </h3>
                            <button
                                onClick={() => dispatch(closeModal('assignRole'))}
                                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            >
                                <XMarkIcon className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Member Name
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="Enter member's name"
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Wallet Address
                                </label>
                                <input
                                    type="text"
                                    name="address"
                                    value={formData.address}
                                    onChange={handleChange}
                                    placeholder="0x..."
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Role
                                </label>
                                <input
                                    type="text"
                                    value={position}
                                    disabled
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-600 text-gray-900 dark:text-gray-300"
                                />
                            </div>

                            {department && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Department
                                    </label>
                                    <input
                                        type="text"
                                        value={department}
                                        disabled
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-600 text-gray-900 dark:text-gray-300"
                                    />
                                </div>
                            )}

                            {/* Actions */}
                            <div className="flex space-x-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => dispatch(closeModal('assignRole'))}
                                    className="flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-600 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-500 transition-colors"
                                >
                                    Cancel
                                </button>
                                <motion.button
                                    type="submit"
                                    disabled={loading || !formData.name || !formData.address}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                                >
                                    {loading ? 'Assigning...' : 'Assign Role'}
                                </motion.button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            </div>
        </AnimatePresence>
    )
}

export default AssignRoleModal