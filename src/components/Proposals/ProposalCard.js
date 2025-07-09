import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { motion } from 'framer-motion'
import {
  CheckCircleIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
} from '@heroicons/react/24/outline'
import { voteOnProposal, finalizeProposal } from '../../store/slices/daoSlice'

const ProposalCard = ({ proposal, index, isActive }) => {
  const dispatch = useDispatch()
  const { contract: dao, quorum, loading } = useSelector((state) => state.dao)
  const { balance } = useSelector((state) => state.token)

  const handleVote = async (option) => {
    if (dao) {
      dispatch(voteOnProposal({
        dao,
        proposalId: proposal.id,
        option,
        weight: balance
      }))
    }
  }

  const handleFinalize = async () => {
    if (dao) {
      dispatch(finalizeProposal({
        dao,
        proposalId: proposal.id
      }))
    }
  }

  const canFinalize = isActive && parseFloat(proposal.votes) >= parseFloat(quorum)
  const votingPower = ((parseFloat(proposal.votes) / parseFloat(quorum)) * 100).toFixed(1)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-white rounded-xl p-4 lg:p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 min-w-0"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-base lg:text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2 truncate">{proposal.name}</h3>
          <div className="flex items-center space-x-2 lg:space-x-4 text-xs lg:text-sm text-gray-600">
            <div className="flex items-center">
              <CurrencyDollarIcon className="w-4 h-4 mr-1" />
              <span className="truncate">{proposal.amount} ETH</span>
            </div>
            <div className="flex items-center">
              <UserGroupIcon className="w-4 h-4 mr-1" />
              <span className="truncate">{proposal.votes} votes</span>
            </div>
          </div>
        </div>
        <div className={`px-2 lg:px-3 py-1 rounded-full text-xs font-medium flex-shrink-0 ml-2 ${
          proposal.finalized
            ? 'bg-green-100 text-green-800'
            : 'bg-yellow-100 text-yellow-800'
        }`}>
          {proposal.finalized ? 'Approved' : 'Active'}
        </div>
      </div>

      {/* Recipient */}
      <div className="mb-4">
        <p className="text-sm text-gray-600">Recipient:</p>
        <p className="text-xs lg:text-sm font-mono text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-700 px-2 py-1 rounded truncate">
          {proposal.recipient}
        </p>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
          <span>Voting Progress</span>
          <span>{votingPower}% of quorum</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(votingPower, 100)}%` }}
            transition={{ duration: 1, delay: index * 0.1 }}
            className={`h-2 rounded-full ${
              votingPower >= 100 ? 'bg-green-500' : 'bg-blue-500'
            }`}
          />
        </div>
      </div>

      {/* Actions */}
      {isActive && (
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleVote(1)}
            disabled={loading}
            className="flex-1 px-3 lg:px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm lg:text-base"
          >
            Vote For
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleVote(2)}
            disabled={loading}
            className="flex-1 px-3 lg:px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm lg:text-base"
          >
            Vote Against
          </motion.button>
          {canFinalize && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleFinalize}
              disabled={loading}
              className="px-3 lg:px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 sm:w-auto w-full"
            >
              <CheckCircleIcon className="w-5 h-5" />
            </motion.button>
          )}
        </div>
      )}

      {proposal.finalized && (
        <div className="flex items-center justify-center py-2 text-green-600">
          <CheckCircleIcon className="w-5 h-5 mr-2" />
          <span className="text-sm font-medium">Proposal Executed</span>
        </div>
      )}
    </motion.div>
  )
}

export default ProposalCard