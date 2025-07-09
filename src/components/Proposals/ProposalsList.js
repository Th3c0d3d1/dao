import React, { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { motion } from 'framer-motion'
import {
  PlusIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline'
import { loadProposals } from '../../store/slices/daoSlice'
import { openModal } from '../../store/slices/uiSlice'
import ProposalCard from './ProposalCard'
import CreateProposalModal from './CreateProposalModal'

const ProposalsList = () => {
  const dispatch = useDispatch()
  const { proposals, loading, contract: dao } = useSelector((state) => state.dao)
  const { modals } = useSelector((state) => state.ui)

  useEffect(() => {
    if (dao) {
      dispatch(loadProposals({ dao }))
    }
  }, [dao, dispatch])

  const activeProposals = proposals.filter(p => !p.finalized)
  const completedProposals = proposals.filter(p => p.finalized)

  const stats = [
    {
      name: 'Total Proposals',
      value: proposals.length,
      icon: ClockIcon,
      color: 'blue',
    },
    {
      name: 'Active',
      value: activeProposals.length,
      icon: ClockIcon,
      color: 'yellow',
    },
    {
      name: 'Approved',
      value: completedProposals.length,
      icon: CheckCircleIcon,
      color: 'green',
    },
    {
      name: 'Rejected',
      value: 0,
      icon: XCircleIcon,
      color: 'red',
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Proposals</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Create and vote on governance proposals</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => dispatch(openModal('createProposal'))}
          className="flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all duration-200"
        >
          <PlusIcon className="w-5 h-5 mr-2" />
          Create Proposal
        </motion.button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-lg p-4 shadow-sm border border-gray-200"
          >
            <div className="flex items-center">
              <div className={`p-2 rounded-lg bg-${stat.color}-50`}>
                <stat.icon className={`w-5 h-5 text-${stat.color}-600`} />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                <p className="text-xl font-bold text-gray-900 dark:text-gray-100">{stat.value}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Active Proposals */}
      {activeProposals.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Active Proposals</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {activeProposals.map((proposal, index) => (
              <ProposalCard
                key={proposal.id}
                proposal={proposal}
                index={index}
                isActive={true}
              />
            ))}
          </div>
        </div>
      )}

      {/* Completed Proposals */}
      {completedProposals.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Completed Proposals</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {completedProposals.map((proposal, index) => (
              <ProposalCard
                key={proposal.id}
                proposal={proposal}
                index={index}
                isActive={false}
              />
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {proposals.length === 0 && !loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <DocumentTextIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No proposals yet</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">Get started by creating your first proposal</p>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => dispatch(openModal('createProposal'))}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all duration-200"
          >
            Create First Proposal
          </motion.button>
        </motion.div>
      )}

      {/* Create Proposal Modal */}
      {modals.createProposal && <CreateProposalModal />}
    </div>
  )
}

export default ProposalsList