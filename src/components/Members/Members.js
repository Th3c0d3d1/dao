import React, { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { motion } from 'framer-motion'
import {
    UserGroupIcon,
    BuildingOfficeIcon,
    StarIcon,
    ChartBarIcon,
    UserIcon,
    BriefcaseIcon,
    AcademicCapIcon,
    HeartIcon,
    MegaphoneIcon,
} from '@heroicons/react/24/outline'
import { loadMembers } from '../../store/slices/membersSlice'

const CORPORATE_POSITIONS = {
    CEO: {
        title: 'Chief Executive Officer',
        icon: StarIcon,
        color: 'purple',
        description: 'Contract deployer and ultimate decision maker'
    },
    CFO: {
        title: 'Chief Financial Officer',
        icon: ChartBarIcon,
        color: 'green',
        description: 'Oversees financial operations and treasury management'
    },
    COO: {
        title: 'Chief Operating Officer',
        icon: BriefcaseIcon,
        color: 'blue',
        description: 'Manages day-to-day operations and execution'
    },
    MARKETING: {
        title: 'Marketing Department',
        icon: MegaphoneIcon,
        color: 'pink',
        description: 'Brand development and community growth'
    },
    RND: {
        title: 'Research & Development',
        icon: AcademicCapIcon,
        color: 'indigo',
        description: 'Innovation and technical advancement'
    },
    HR: {
        title: 'Human Relations',
        icon: HeartIcon,
        color: 'red',
        description: 'Team management and organizational culture'
    }
}

const VOTING_WEIGHT_TIERS = [
    {
        name: 'Whale Holders',
        minTokens: 100000,
        color: 'purple',
        icon: StarIcon,
        description: 'Major stakeholders with significant voting power'
    },
    {
        name: 'Large Holders',
        minTokens: 50000,
        maxTokens: 99999,
        color: 'blue',
        icon: StarIcon,
        description: 'Substantial token holders with strong influence'
    },
    {
        name: 'Medium Holders',
        minTokens: 10000,
        maxTokens: 49999,
        color: 'green',
        icon: ChartBarIcon,
        description: 'Active participants with moderate voting weight'
    },
    {
        name: 'Small Holders',
        minTokens: 1000,
        maxTokens: 9999,
        color: 'yellow',
        icon: UserIcon,
        description: 'Community members with basic voting rights'
    },
    {
        name: 'Micro Holders',
        minTokens: 0,
        maxTokens: 999,
        color: 'gray',
        icon: UserIcon,
        description: 'New or minimal token holders'
    }
]

const Members = () => {
    const dispatch = useDispatch()
    const { contract: dao } = useSelector((state) => state.dao)
    const { contract: token } = useSelector((state) => state.token)
    const { members = {}, loading } = useSelector((state) => state.members)

    const [activeTab, setActiveTab] = useState('corporate')

    useEffect(() => {
        if (dao && token) {
            dispatch(loadMembers({ dao, token }))
        }
    }, [dao, token, dispatch])

    const renderCorporateStructure = () => (
        <div className="space-y-8 dark:text-gray-200">
            {/* Executive Level */}
            <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-200 mb-6 flex items-center">
                    <BuildingOfficeIcon className="w-6 h-6 mr-2 text-purple-600" />
                    Executive Leadership
                </h2>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
                    {['CEO', 'CFO', 'COO'].map((position) => {
                        const config = CORPORATE_POSITIONS[position]
                        const Icon = config.icon
                        const member = members.executives?.find(m => m.position === position)

                        return (
                            <motion.div
                                key={position}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="light:bg-white dark:bg-gray-700 rounded-xl p-4 lg:p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow min-w-0"
                            >
                                <div className="flex items-center mb-4">
                                    <div className={`p-3 rounded-lg bg-${config.color}-50`}>
                                        <Icon className={`w-6 h-6 text-${config.color}-600`} />
                                    </div>
                                    <div className="ml-3 min-w-0 flex-1">
                                        <h3 className="font-semibold text-gray-900 dark:text-gray-200 truncate">{position}</h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-300 truncate">{config.title}</p>
                                    </div>
                                </div>

                                {member ? (
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Address:</span>
                                            <span className="text-xs font-mono text-gray-600 dark:text-gray-300 truncate ml-2">
                                                {member.address.slice(0, 6)}...{member.address.slice(-4)}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Tokens:</span>
                                            <span className="text-sm font-bold text-gray-900">
                                                {parseFloat(member.balance).toLocaleString()}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Voting Weight:</span>
                                            <span className="text-sm font-bold text-blue-600 dark:text-gray-300">
                                                {member.votingWeight}%
                                            </span>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center py-4">
                                        <p className="text-sm text-gray-500 dark:text-gray-300">Position Available</p>
                                        <button className="mt-2 px-3 py-1 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                                            Assign Role
                                        </button>
                                    </div>
                                )}

                                <p className="text-xs text-gray-500 dark:text-gray-300 mt-4 truncate">{config.description}</p>
                            </motion.div>
                        )
                    })}
                </div>
            </div>

            {/* Department Level */}
            <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-200 mb-6 flex items-center">
                    <UserGroupIcon className="w-6 h-6 mr-2 text-blue-600" />
                    Department Heads
                </h2>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
                    {['MARKETING', 'RND', 'HR'].map((department) => {
                        const config = CORPORATE_POSITIONS[department]
                        const Icon = config.icon
                        const head = members.departmentHeads?.find(m => m.department === department)
                        const employees = members.employees?.filter(m => m.department === department) || []

                        return (
                            <motion.div
                                key={department}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="light:bg-white dark:bg-gray-700 rounded-xl p-4 lg:p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow min-w-0"
                            >
                                <div className="flex items-center mb-4">
                                    <div className={`p-3 shadow-sm border border-gray-200 rounded-lg bg-${config.color}-50`}>
                                        <Icon className={`w-6 h-6 text-${config.color}-600`} />
                                    </div>
                                    <div className="ml-3 min-w-0 flex-1">
                                        <h3 className="font-semibold text-gray-900 dark:text-gray-200 truncate">{config.title}</h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-300 truncate">Department Head</p>
                                    </div>
                                </div>

                                {head ? (
                                    <div className="space-y-3 mb-4">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Head:</span>
                                            <span className="text-xs font-mono text-gray-600 dark:text-gray-300 truncate ml-2">
                                                {head.address.slice(0, 6)}...{head.address.slice(-4)}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Tokens:</span>
                                            <span className="text-sm font-bold text-gray-900 dark:text-gray-300">
                                                {parseFloat(head.balance).toLocaleString()}
                                            </span>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center py-2 mb-4">
                                        <p className="text-sm text-gray-500 dark:text-gray-300">No Department Head</p>
                                    </div>
                                )}

                                <div className="border-t pt-3">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Employees:</span>
                                        <span className="text-sm font-bold text-gray-900 dark:text-gray-200">{employees.length}</span>
                                    </div>
                                    {employees.length > 0 ? (
                                        <div className="space-y-1">
                                            {employees.slice(0, 3).map((employee, index) => (
                                                <div key={index} className="text-xs text-gray-600 dark:text-gray-300 font-mono truncate">
                                                    {employee.address.slice(0, 6)}...{employee.address.slice(-4)}
                                                </div>
                                            ))}
                                            {employees.length > 3 && (
                                                <p className="text-xs text-gray-500 dark:text-gray-300">+{employees.length - 3} more</p>
                                            )}
                                        </div>
                                    ) : (
                                        <p className="text-xs text-gray-500 dark:text-gray-300">No employees assigned</p>
                                    )}
                                </div>

                                <p className="text-xs text-gray-500 dark:text-gray-300 mt-4 truncate">{config.description}</p>
                            </motion.div>
                        )
                    })}
                </div>
            </div>
        </div>
    )

    const renderTokenHolders = () => (
        <div className="space-y-6">
            <h2 className="text-xl font-bold light:text-gray-900 dark:text-gray-200 mb-6 flex items-center">
                <ChartBarIcon className="w-6 h-6 mr-2 text-green-600" />
                Token Holders by Voting Weight
            </h2>

            {VOTING_WEIGHT_TIERS.map((tier) => {
                const Icon = tier.icon
                const tierHolders = members.tokenHolders?.filter(holder => {
                    const balance = parseFloat(holder.balance)
                    if (tier.maxTokens) {
                        return balance >= tier.minTokens && balance <= tier.maxTokens
                    }
                    return balance >= tier.minTokens
                }) || []

                return (
                    <motion.div
                        key={tier.name}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="light:bg-white dark:bg-gray-700 rounded-xl p-6 shadow-sm border border-gray-200"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center">
                                <div className={`p-3 rounded-lg bg-${tier.color}-50`}>
                                    <Icon className={`w-6 h-6 text-${tier.color}-600`} />
                                </div>
                                <div className="ml-3">
                                    <h3 className="font-semibold light:text-gray-700 dark:text-gray-200">{tier.name}</h3>
                                    <p className="text-sm light:text-gray-600 dark:text-gray-300">{tier.description}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-2xl font-bold light:text-gray-700 dark:text-gray-300">{tierHolders.length}</p>
                                <p className="text-sm light:text-gray-600 dark:text-gray-300">holders</p>
                            </div>
                        </div>

                        <div className="mb-4">
                            <div className="flex items-center justify-between text-sm light:text-gray-600 dark:text-gray-300 mb-2">
                                <span>Token Range:</span>
                                <span className="font-medium">
                                    {tier.minTokens.toLocaleString()}
                                    {tier.maxTokens ? ` - ${tier.maxTokens.toLocaleString()}` : '+'}
                                </span>
                            </div>
                        </div>

                        {tierHolders.length > 0 ? (
                            <div className="space-y-2 max-h-40 overflow-y-auto">
                                {tierHolders.map((holder, index) => (
                                    <div key={index} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg">
                                        <span className="text-sm font-mono text-gray-700 dark:text-gray-300">
                                            {holder.address.slice(0, 8)}...{holder.address.slice(-6)}
                                        </span>
                                        <div className="text-right">
                                            <p className="text-sm font-bold text-gray-900 dark:text-gray-300">
                                                {parseFloat(holder.balance).toLocaleString()}
                                            </p>
                                            <p className="text-xs text-gray-500 dark:text-gray-300">
                                                {holder.votingWeight}% weight
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-center text-gray-500 dark:text-gray-200 py-4">No holders in this tier</p>
                        )}
                    </motion.div>
                )
            })}
        </div>
    )

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Organization Members</h1>
                    <p className="text-gray-600 mt-1 dark:text-gray-200">Corporate structure and token holder distribution</p>
                </div>

                {/* Tab Navigation */}
                <div className="flex space-x-2 bg-gray-100 rounded-lg p-1">
                    <button
                        onClick={() => setActiveTab('corporate')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'corporate'
                                ? 'bg-white text-gray-900 shadow-sm'
                                : 'text-gray-600 hover:text-gray-900'
                            }`}
                    >
                        Corporate Structure
                    </button>
                    <button
                        onClick={() => setActiveTab('holders')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'holders'
                                ? 'bg-white text-gray-900 shadow-sm'
                                : 'text-gray-600 hover:text-gray-900'
                            }`}
                    >
                        Token Holders
                    </button>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
                <div className="light:bg-white dark:bg-gray-700 rounded-lg p-4 shadow-sm border border-gray-200">
                    <div className="flex items-center">
                        <div className="p-1.5 lg:p-2 shadow-sm border border-gray-200 rounded-lg bg-purple-50 flex-shrink-0">
                            <StarIcon className="w-4 h-4 lg:w-5 lg:h-5 text-purple-600" />
                        </div>
                        <div className="ml-2 lg:ml-3 min-w-0 flex-1">
                            <p className="text-xs lg:text-sm font-medium text-gray-600 dark:text-gray-200 truncate">Executives</p>
                            <p className="text-lg lg:text-xl font-bold text-gray-900 dark:text-gray-300">{members.executives?.length || 0}</p>
                        </div>
                    </div>
                </div>

                <div className="light:bg-white dark:bg-gray-700 rounded-lg p-4 shadow-sm border border-gray-200">
                    <div className="flex items-center">
                        <div className="p-1.5 lg:p-2 shadow-sm border border-gray-200 rounded-lg bg-blue-50 flex-shrink-0">
                            <UserGroupIcon className="w-4 h-4 lg:w-5 lg:h-5 text-blue-600" />
                        </div>
                        <div className="ml-2 lg:ml-3 min-w-0 flex-1">
                            <p className="text-xs lg:text-sm font-medium text-gray-600 dark:text-gray-200 truncate">Department Heads</p>
                            <p className="text-lg lg:text-xl font-bold text-gray-900 dark:text-gray-300">{members.departmentHeads?.length || 0}</p>
                        </div>
                    </div>
                </div>

                <div className="light:bg-white dark:bg-gray-700 rounded-lg p-4 shadow-sm border border-gray-200">
                    <div className="flex items-center">
                        <div className="p-1.5 lg:p-2 shadow-sm border border-gray-200 rounded-lg bg-green-50 flex-shrink-0">
                            <UserIcon className="w-4 h-4 lg:w-5 lg:h-5 text-green-600" />
                        </div>
                        <div className="ml-2 lg:ml-3 min-w-0 flex-1">
                            <p className="text-xs lg:text-sm font-medium text-gray-600 dark:text-gray-200 truncate">Employees</p>
                            <p className="text-lg lg:text-xl font-bold text-gray-900 dark:text-gray-300">{members.employees?.length || 0}</p>
                        </div>
                    </div>
                </div>

                <div className="light:bg-white dark:bg-gray-700 rounded-lg p-4 shadow-sm border border-gray-200">
                    <div className="flex items-center">
                        <div className="p-1.5 lg:p-2 shadow-sm border border-gray-200 rounded-lg bg-yellow-50 flex-shrink-0">
                            <ChartBarIcon className="w-4 h-4 lg:w-5 lg:h-5 text-yellow-600" />
                        </div>
                        <div className="ml-2 lg:ml-3 min-w-0 flex-1">
                            <p className="text-xs lg:text-sm font-medium text-gray-600 dark:text-gray-200 truncate">Token Holders</p>
                            <p className="text-lg lg:text-xl font-bold text-gray-900 dark:text-gray-300">{members.tokenHolders?.length || 0}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            {loading ? (
                <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="text-gray-600 dark:text-gray-300 mt-4">Loading members...</p>
                </div>
            ) : (
                <>
                    {activeTab === 'corporate' && renderCorporateStructure()}
                    {activeTab === 'holders' && renderTokenHolders()}
                </>
            )}
        </div>
    )
}

export default Members