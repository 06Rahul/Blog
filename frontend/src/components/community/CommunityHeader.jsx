import React from 'react';
import { Users, Lock, Globe, Settings, LogOut, LogIn, X, Check, UserMinus } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { communityService } from '../../services/communityService';
import { useAuth } from '../../context/AuthContext';
import { userService } from '../../services/userService';
import toast from 'react-hot-toast';

const ManageMembersModal = ({ community, onClose }) => {
    const [members, setMembers] = React.useState([]);
    const [query, setQuery] = React.useState('');
    const [results, setResults] = React.useState([]);
    const [loading, setLoading] = React.useState(false);

    const loadMembers = React.useCallback(async () => {
        try {
            setLoading(true);
            const data = await communityService.getMembers(community.id);
            setMembers(data);
        } catch (error) {
            console.error('Failed to load members', error);
        } finally {
            setLoading(false);
        }
    }, [community.id]);

    React.useEffect(() => {
        loadMembers();
    }, [loadMembers]);

    React.useEffect(() => {
        const timer = setTimeout(async () => {
            if (!query.trim()) {
                setResults([]);
                return;
            }
            try {
                const data = await userService.searchUsers(query, 8);
                setResults(data);
            } catch (error) {
                console.error('Failed to search users', error);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [query]);

    const handleAccept = async (userId) => {
        try {
            await communityService.acceptJoinRequest(community.id, userId);
            toast.success('Member accepted');
            loadMembers();
        } catch (error) {
            toast.error('Failed to accept');
        }
    };

    const handleReject = async (userId) => {
        try {
            await communityService.rejectJoinRequest(community.id, userId);
            toast.success('Request rejected');
            loadMembers();
        } catch (error) {
            toast.error('Failed to reject');
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
                <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/50">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Users className="w-5 h-5 text-indigo-600" />
                        Community Members
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                <div className="p-6 flex-1 overflow-y-auto space-y-6">
                    {/* Invite Section */}
                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Invite Members</label>
                        <div className="relative">
                            <input
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Search users by name..."
                                className="w-full border-none bg-gray-100 dark:bg-gray-700 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 transition-all dark:text-white"
                            />
                        </div>
                        {results.length > 0 && (
                            <div className="mt-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-700 rounded-xl divide-y divide-gray-100 dark:divide-gray-700">
                                {results.map((user) => (
                                    <div key={user.id} className="flex items-center justify-between p-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xs uppercase">
                                                {user.username[0]}
                                            </div>
                                            <div>
                                                <div className="text-sm font-bold text-gray-900 dark:text-white">@{user.username}</div>
                                                <div className="text-xs text-gray-500 truncate max-w-[150px]">{user.bio || 'New user'}</div>
                                            </div>
                                        </div>
                                        <button
                                            onClick={async () => {
                                                await communityService.addMember(community.id, user.id);
                                                toast.success(`Invited ${user.username}`);
                                                setQuery('');
                                                setResults([]);
                                                loadMembers();
                                            }}
                                            className="px-4 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 transition-colors shadow-sm"
                                        >
                                            Invite
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Member List */}
                    <div className="space-y-4">
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Current Members & Requests</label>
                        {loading && members.length === 0 && <div className="text-center py-8 text-gray-400 animate-pulse">Loading members...</div>}
                        {members.map((member) => (
                            <div key={member.userId} className="group flex items-center justify-between p-4 bg-white dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 rounded-2xl hover:border-indigo-200 dark:hover:border-indigo-900/50 transition-all shadow-sm">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm uppercase">
                                        {member.username[0]}
                                    </div>
                                    <div>
                                        <div className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                            @{member.username}
                                            {member.status === 'PENDING' && (
                                                <span className="px-2 py-0.5 bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 text-[10px] font-black uppercase rounded-full">Request</span>
                                            )}
                                        </div>
                                        <div className="text-[11px] text-gray-400 tracking-wide uppercase font-bold">
                                            {member.role} • {member.status === 'ACCEPTED' ? `Joined ${new Date(member.joinedAt).toLocaleDateString()}` : member.status}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    {member.status === 'PENDING' ? (
                                        <>
                                            <button onClick={() => handleAccept(member.userId)} className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors shadow-lg shadow-green-500/20">
                                                <Check className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => handleReject(member.userId)} className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors shadow-lg shadow-red-500/20">
                                                <X className="w-4 h-4" />
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <select
                                                value={member.role}
                                                onChange={async (e) => {
                                                    await communityService.assignRole(community.id, member.userId, e.target.value);
                                                    toast.success('Role updated');
                                                    loadMembers();
                                                }}
                                                className="border-none bg-gray-50 dark:bg-gray-700 rounded-lg px-2 py-1 text-xs font-bold dark:text-gray-300 focus:ring-0"
                                            >
                                                <option value="MEMBER">Member</option>
                                                <option value="MODERATOR">Moderator</option>
                                                <option value="ADMIN">Admin</option>
                                                {member.role === 'OWNER' && <option value="OWNER">Owner</option>}
                                            </select>
                                            {member.role !== 'OWNER' && (
                                                <button
                                                    onClick={async () => {
                                                        if (window.confirm(`Remove ${member.username} from community?`)) {
                                                            await communityService.removeMember(community.id, member.userId);
                                                            toast.success('Member removed');
                                                            loadMembers();
                                                        }
                                                    }}
                                                    className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-colors"
                                                >
                                                    <UserMinus className="w-4 h-4" />
                                                </button>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export const CommunityHeader = ({ community }) => {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const [showManage, setShowManage] = React.useState(false);

    const joinMutation = useMutation({
        mutationFn: () => communityService.joinCommunity(community.id),
        onSuccess: () => {
            queryClient.invalidateQueries(['community', community.id]);
            toast.success('Join request sent!');
        },
        onError: (err) => {
            toast.error(err.message || 'Failed to join');
        }
    });

    const leaveMutation = useMutation({
        mutationFn: () => communityService.leaveCommunity(community.id),
        onSuccess: () => {
            queryClient.invalidateQueries(['community', community.id]);
            toast.success('Left community');
        }
    });

    const isMember = community.myRole != null && community.myStatus === 'ACCEPTED';
    const isOwner = community.myRole === 'OWNER';
    const isPending = community.myStatus === 'PENDING';

    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-8 mb-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <div className="flex items-center flex-wrap gap-3 mb-4">
                        <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight">
                            {community.name}
                        </h1>
                        <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm ${community.visibility === 'PUBLIC'
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400'
                            : 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400'
                            }`}>
                            {community.visibility === 'PUBLIC' ? <Globe className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                            {community.visibility}
                        </div>
                    </div>

                    <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-2xl leading-relaxed text-sm">
                        {community.description}
                    </p>

                    <div className="flex items-center flex-wrap gap-6 text-xs font-bold text-gray-400 uppercase tracking-widest">
                        <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-indigo-500" />
                            <span>{community.memberCount || 0} Members</span>
                        </div>
                        {community.categoryName && (
                            <div className="px-2 py-0.5 border border-gray-200 dark:border-gray-700 rounded text-gray-500 dark:text-gray-400">
                                {community.categoryName}
                            </div>
                        )}
                        <div>
                            Owner: <span className="text-gray-900 dark:text-gray-300">@{community.ownerName}</span>
                        </div>
                    </div>
                </div>

                <div className="flex gap-4 shrink-0">
                    {user && !isMember && (
                        <button
                            onClick={() => joinMutation.mutate()}
                            disabled={joinMutation.isPending || isPending || community.myStatus === 'REJECTED'}
                            className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white transition-all shadow-lg disabled:opacity-50 ${
                                isPending ? 'bg-amber-500' : community.myStatus === 'REJECTED' ? 'bg-red-600' : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/20'
                            }`}
                        >
                            {isPending ? (
                                <>
                                    <Users className="w-4 h-4" />
                                    Request Sent
                                </>
                            ) : community.myStatus === 'REJECTED' ? (
                                <>
                                    <X className="w-4 h-4" />
                                    Declined
                                </>
                            ) : (
                                <>
                                    <LogIn className="w-4 h-4" />
                                    {community.visibility === 'PRIVATE' ? 'Request Access' : 'Join'}
                                </>
                            )}
                        </button>
                    )}

                    {user && isMember && !isOwner && (
                        <button
                            onClick={() => leaveMutation.mutate()}
                            disabled={leaveMutation.isPending}
                            className="inline-flex items-center gap-2 px-6 py-2.5 bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-xl text-sm font-bold hover:bg-gray-100 dark:hover:bg-gray-600 transition-all border border-gray-200 dark:border-gray-600"
                        >
                            <LogOut className="w-4 h-4" />
                            Leave
                        </button>
                    )}

                    {(isOwner || community.myRole === 'ADMIN') && (
                        <button
                            onClick={() => setShowManage(true)}
                            className="inline-flex items-center gap-2 px-6 py-2.5 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl text-sm font-bold hover:bg-gray-50 dark:hover:bg-gray-700 transition-all border border-gray-200 dark:border-gray-700 shadow-sm"
                        >
                            <Settings className="w-4 h-4" />
                            Manage
                        </button>
                    )}
                </div>
            </div>

            {showManage && <ManageMembersModal community={community} onClose={() => setShowManage(false)} />}
        </div>
    );
};
