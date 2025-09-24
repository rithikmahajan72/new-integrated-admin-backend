import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Search,
  Mail,
  Star,
  Send,
  FileText,
  AlertTriangle,
  Trash2,
  Plus,
  MoreHorizontal,
  Archive,
  Reply,
  Forward,
  ArrowLeft,
  Paperclip,
  RefreshCw,
  Filter,
  X,
  Check,
  Eye,
  EyeOff,
} from "lucide-react";

// Redux imports
import {
  getFolderCounts,
  getMessages,
  getMessage,
  sendMessage,
  replyToMessage,
  updateMessageStatus,
  bulkUpdateMessages,
  deleteMessage,
  getThreadMessages,
  setActiveFolder,
  setSearchQuery,
  toggleMessageSelection,
  selectAllMessages,
  clearSelectedMessages,
  setSelectedMessage,
  clearSelectedMessage,
  showComposeModal,
  hideComposeModal,
  updateComposeData,
  setFilters,
  clearFilters,
  clearError,
  // Selectors
  selectInboxState,
  selectMessages,
  selectSelectedMessage,
  selectActiveFolder,
  selectSelectedMessages,
  selectFolderCounts,
  selectInboxLoading,
  selectInboxError,
  selectPagination,
  selectComposeModal,
  selectFilters,
} from "../store/slices/inboxSlice";

// Compose Modal Component
const ComposeModal = ({ isOpen, onClose }) => {
  const dispatch = useDispatch();
  const { data: composeData } = useSelector(selectComposeModal);
  const loading = useSelector(selectInboxLoading);

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(sendMessage(composeData));
  };

  const handleInputChange = (field, value) => {
    dispatch(updateComposeData({ [field]: value }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Compose Message</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                To
              </label>
              <input
                type="email"
                value={composeData.recipientEmail}
                onChange={(e) => handleInputChange('recipientEmail', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="recipient@example.com"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name (Optional)
              </label>
              <input
                type="text"
                value={composeData.recipientName}
                onChange={(e) => handleInputChange('recipientName', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Recipient Name"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Subject
              </label>
              <input
                type="text"
                value={composeData.subject}
                onChange={(e) => handleInputChange('subject', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter subject"
                required
              />
            </div>
            
            <div className="flex space-x-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  value={composeData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="Primary">Primary</option>
                  <option value="Social">Social</option>
                  <option value="Work">Work</option>
                  <option value="Friends">Friends</option>
                  <option value="Support">Support</option>
                </select>
              </div>
              
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Priority
                </label>
                <select
                  value={composeData.priority}
                  onChange={(e) => handleInputChange('priority', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="low">Low</option>
                  <option value="normal">Normal</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Message
              </label>
              <textarea
                value={composeData.content}
                onChange={(e) => handleInputChange('content', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={6}
                placeholder="Type your message here..."
                required
              />
            </div>
          </div>
          
          <div className="flex items-center justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <RefreshCw size={16} className="animate-spin" />
              ) : (
                <Send size={16} />
              )}
              Send Message
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Reply Modal Component
const ReplyModal = ({ message, isOpen, onClose }) => {
  const dispatch = useDispatch();
  const loading = useSelector(selectInboxLoading);
  const [replyContent, setReplyContent] = useState('');
  const [priority, setPriority] = useState('normal');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (replyContent.trim()) {
      dispatch(replyToMessage({
        messageId: message.id,
        content: replyContent,
        priority
      }));
      setReplyContent('');
      onClose();
    }
  };

  if (!isOpen || !message) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Reply to Message</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6">
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <div className="text-sm text-gray-500 mb-2">Replying to:</div>
            <div className="font-medium text-gray-900">{message.subject}</div>
            <div className="text-sm text-gray-600">From: {message.sender}</div>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Priority
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="low">Low</option>
                  <option value="normal">Normal</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reply
                </label>
                <textarea
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={6}
                  placeholder="Type your reply here..."
                  required
                />
              </div>
            </div>
            
            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <RefreshCw size={16} className="animate-spin" />
                ) : (
                  <Reply size={16} />
                )}
                Send Reply
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const Inbox = () => {
  const dispatch = useDispatch();
  
  // Redux state
  const inboxState = useSelector(selectInboxState);
  const messages = useSelector(selectMessages);
  const selectedMessage = useSelector(selectSelectedMessage);
  const activeFolder = useSelector(selectActiveFolder);
  const selectedMessages = useSelector(selectSelectedMessages);
  const folderCounts = useSelector(selectFolderCounts);
  const loading = useSelector(selectInboxLoading);
  const error = useSelector(selectInboxError);
  const pagination = useSelector(selectPagination);
  const composeModal = useSelector(selectComposeModal);
  const filters = useSelector(selectFilters);

  // Local state
  const [searchQuery, setSearchQueryLocal] = useState('');
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [replyingToMessage, setReplyingToMessage] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  // Initialize data on component mount
  useEffect(() => {
    dispatch(getFolderCounts());
    dispatch(getMessages({ folder: activeFolder }));
  }, [dispatch, activeFolder]);

  // Handle search with debounce
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      dispatch(setSearchQuery(searchQuery));
      dispatch(getMessages({ 
        folder: activeFolder, 
        search: searchQuery,
        ...filters
      }));
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery, dispatch, activeFolder, filters]);

  // Error handling
  useEffect(() => {
    if (error) {
      console.error('Inbox error:', error);
      // You can add toast notification here
      setTimeout(() => dispatch(clearError()), 5000);
    }
  }, [error, dispatch]);

  const sidebarItems = [
    { id: "inbox", icon: Mail, label: "Inbox", count: folderCounts.inbox?.total || 0 },
    { id: "starred", icon: Star, label: "Starred", count: folderCounts.starred?.total || 0 },
    { id: "sent", icon: Send, label: "Sent", count: folderCounts.sent?.total || 0 },
    { id: "draft", icon: FileText, label: "Draft", count: folderCounts.draft?.total || 0 },
    { id: "spam", icon: AlertTriangle, label: "Spam", count: folderCounts.spam?.total || 0 },
    { id: "important", icon: Mail, label: "Important", count: folderCounts.important?.total || 0 },
    { id: "bin", icon: Trash2, label: "Bin", count: folderCounts.bin?.total || 0 },
  ];

  const labels = [
    { name: "Primary", color: "bg-cyan-500", textColor: "text-cyan-700" },
    { name: "Social", color: "bg-blue-500", textColor: "text-blue-700" },
    { name: "Work", color: "bg-purple-500", textColor: "text-purple-700" },
    { name: "Friends", color: "bg-pink-500", textColor: "text-pink-700" },
    { name: "Support", color: "bg-green-500", textColor: "text-green-700" },
  ];

  const handleFolderClick = (folderId) => {
    dispatch(setActiveFolder(folderId));
    dispatch(clearSelectedMessages());
    dispatch(clearSelectedMessage());
  };

  const handleMessageClick = (message) => {
    dispatch(setSelectedMessage(message));
    // Mark as read if unread
    if (message.unread) {
      dispatch(updateMessageStatus({
        messageId: message.id,
        updates: { status: 'read' }
      }));
    }
  };

  const handleMessageSelection = (messageId, e) => {
    e.stopPropagation();
    dispatch(toggleMessageSelection(messageId));
  };

  const handleSelectAllMessages = () => {
    if (selectedMessages.length === messages.length) {
      dispatch(clearSelectedMessages());
    } else {
      dispatch(selectAllMessages());
    }
  };

  const handleBulkAction = (action) => {
    if (selectedMessages.length > 0) {
      dispatch(bulkUpdateMessages({
        messageIds: selectedMessages,
        action
      }));
    }
  };

  const handleStarMessage = (messageId, isStarred) => {
    dispatch(updateMessageStatus({
      messageId,
      updates: { isStarred: !isStarred }
    }));
  };

  const handleReplyMessage = (message) => {
    setReplyingToMessage(message);
    setShowReplyModal(true);
  };

  const handleRefresh = () => {
    dispatch(getFolderCounts());
    dispatch(getMessages({ folder: activeFolder, ...filters }));
  };

  const getTagColor = (tag) => {
    const label = labels.find((l) => l.name === tag);
    return label ? label.color : "bg-gray-500";
  };

  const getViewTitle = () => {
    const item = sidebarItems.find((item) => item.id === activeFolder);
    return item ? item.label : "Inbox";
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'text-red-600';
      case 'high': return 'text-orange-600';
      case 'normal': return 'text-blue-600';
      case 'low': return 'text-gray-600';
      default: return 'text-gray-600';
    }
  };

  // Message detail view
  if (selectedMessage) {
    return (
      <div className="flex h-screen bg-gray-50">
        {/* Sidebar */}
        <aside className="w-72 bg-white shadow-lg border-r border-gray-200">
          <div className="p-6">
            <button 
              onClick={() => dispatch(showComposeModal())}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
            >
              <Plus size={18} />
              Compose
            </button>
          </div>

          <nav className="px-3">
            <ul className="space-y-1">
              {sidebarItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeFolder === item.id;
                return (
                  <li key={item.id}>
                    <button
                      onClick={() => handleFolderClick(item.id)}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-lg cursor-pointer transition-all duration-200 ${
                        isActive
                          ? "bg-blue-50 text-blue-700 border-l-4 border-blue-600"
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon
                          size={18}
                          className={
                            isActive ? "text-blue-600" : "text-gray-500"
                          }
                        />
                        <span
                          className={`font-medium ${
                            isActive ? "text-blue-700" : ""
                          }`}
                        >
                          {item.label}
                        </span>
                      </div>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          isActive
                            ? "bg-blue-100 text-blue-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {item.count}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="px-6 mt-8">
            <h4 className="font-semibold text-gray-900 mb-3">Labels</h4>
            <ul className="space-y-2">
              {labels.map((label, index) => (
                <li
                  key={index}
                  className="flex items-center gap-3 px-2 py-1 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <div className={`w-3 h-3 rounded-full ${label.color}`}></div>
                  <span className={`text-sm font-medium ${label.textColor}`}>
                    {label.name}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        {/* Message Detail View */}
        <div className="flex-1 flex flex-col bg-white">
          {/* Header */}
          <header className="border-b border-gray-200 px-6 py-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => dispatch(clearSelectedMessage())}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft size={20} />
              </button>
              <div className="flex-1">
                <h1 className="text-xl font-semibold text-gray-900">
                  {selectedMessage.subject}
                </h1>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-sm ${getPriorityColor(selectedMessage.priority)}`}>
                    {selectedMessage.priority?.toUpperCase()}
                  </span>
                  {selectedMessage.messageType && (
                    <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">
                      {selectedMessage.messageType.replace('_', ' ').toUpperCase()}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => handleStarMessage(selectedMessage.id, selectedMessage.starred)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Star size={18} className={selectedMessage.starred ? "fill-yellow-500 text-yellow-500" : ""} />
                </button>
                <button 
                  onClick={() => dispatch(updateMessageStatus({
                    messageId: selectedMessage.id,
                    updates: { folder: 'archived' }
                  }))}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Archive size={18} />
                </button>
                <button 
                  onClick={() => dispatch(updateMessageStatus({
                    messageId: selectedMessage.id,
                    updates: { folder: 'bin' }
                  }))}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Trash2 size={18} />
                </button>
                <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                  <MoreHorizontal size={18} />
                </button>
              </div>
            </div>
          </header>

          {/* Message Content */}
          <div className="flex-1 overflow-auto p-6">
            <div className="max-w-4xl mx-auto">
              {/* Message Header */}
              <div className="bg-gray-50 rounded-xl p-6 mb-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-medium flex-shrink-0">
                    {selectedMessage.avatar}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {selectedMessage.sender}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {selectedMessage.email}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">
                          {selectedMessage.date}
                        </p>
                        <p className="text-sm text-gray-500">
                          {selectedMessage.time}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium text-white ${getTagColor(
                          selectedMessage.tag
                        )}`}
                      >
                        {selectedMessage.tag}
                      </span>
                      {selectedMessage.important && (
                        <Star
                          size={14}
                          className="text-yellow-500 fill-current"
                        />
                      )}
                      {selectedMessage.attachments?.length > 0 && (
                        <span className="flex items-center gap-1 text-xs text-gray-500">
                          <Paperclip size={12} />
                          {selectedMessage.attachments.length}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Message Body */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="prose max-w-none">
                  <div className="whitespace-pre-line text-gray-700 leading-relaxed">
                    {selectedMessage.content}
                  </div>
                </div>
                
                {/* Attachments */}
                {selectedMessage.attachments?.length > 0 && (
                  <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-3">Attachments</h4>
                    <div className="space-y-2">
                      {selectedMessage.attachments.map((attachment, index) => (
                        <div key={index} className="flex items-center gap-3 p-2 bg-white rounded border">
                          <Paperclip size={16} className="text-gray-400" />
                          <span className="flex-1 text-sm text-gray-700">{attachment.fileName}</span>
                          <span className="text-xs text-gray-500">{attachment.fileSize}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Reply Actions */}
              <div className="flex items-center gap-3 mt-6">
                <button 
                  onClick={() => handleReplyMessage(selectedMessage)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Reply size={16} />
                  Reply
                </button>
                <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                  <Forward size={16} />
                  Forward
                </button>
                <button 
                  onClick={() => dispatch(updateMessageStatus({
                    messageId: selectedMessage.id,
                    updates: { isImportant: !selectedMessage.important }
                  }))}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Star size={16} className={selectedMessage.important ? "fill-yellow-500 text-yellow-500" : ""} />
                  {selectedMessage.important ? 'Remove from Important' : 'Mark Important'}
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Modals */}
        <ComposeModal 
          isOpen={composeModal.show} 
          onClose={() => dispatch(hideComposeModal())} 
        />
        <ReplyModal 
          message={replyingToMessage} 
          isOpen={showReplyModal} 
          onClose={() => setShowReplyModal(false)} 
        />
      </div>
    );
  }

  // Main inbox view
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-72 bg-white shadow-lg border-r border-gray-200">
        <div className="p-6">
          <button 
            onClick={() => dispatch(showComposeModal())}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
          >
            <Plus size={18} />
            Compose
          </button>
        </div>

        <nav className="px-3">
          <ul className="space-y-1">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeFolder === item.id;
              const unreadCount = folderCounts[item.id]?.unread || 0;
              return (
                <li key={item.id}>
                  <button
                    onClick={() => handleFolderClick(item.id)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-lg cursor-pointer transition-all duration-200 ${
                      isActive
                        ? "bg-blue-50 text-blue-700 border-l-4 border-blue-600"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon
                        size={18}
                        className={isActive ? "text-blue-600" : "text-gray-500"}
                      />
                      <span
                        className={`font-medium ${
                          isActive ? "text-blue-700" : ""
                        }`}
                      >
                        {item.label}
                      </span>
                      {unreadCount > 0 && (
                        <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      {unreadCount > 0 && (
                        <span className="text-xs px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded-full font-medium">
                          {unreadCount}
                        </span>
                      )}
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          isActive
                            ? "bg-blue-100 text-blue-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {item.count}
                      </span>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="px-6 mt-8">
          <h4 className="font-semibold text-gray-900 mb-3">Labels</h4>
          <ul className="space-y-2">
            {labels.map((label, index) => (
              <li
                key={index}
                onClick={() => dispatch(setFilters({ category: label.name }))}
                className="flex items-center gap-3 px-2 py-1 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
              >
                <div className={`w-3 h-3 rounded-full ${label.color}`}></div>
                <span className={`text-sm font-medium ${label.textColor}`}>
                  {label.name}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold text-gray-900">
                {getViewTitle()}
              </h1>
              {loading && (
                <RefreshCw size={16} className="animate-spin text-blue-600" />
              )}
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={handleRefresh}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                title="Refresh"
              >
                <RefreshCw size={18} />
              </button>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`p-2 hover:bg-gray-100 rounded-lg transition-colors ${
                  showFilters ? 'text-blue-600 bg-blue-50' : 'text-gray-400 hover:text-gray-600'
                }`}
                title="Filters"
              >
                <Filter size={18} />
              </button>
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={18}
                />
                <input
                  type="text"
                  placeholder="Search messages..."
                  value={searchQuery}
                  onChange={(e) => setSearchQueryLocal(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-80"
                />
              </div>
            </div>
          </div>
          
          {/* Filters */}
          {showFilters && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                  <select
                    value={filters.priority}
                    onChange={(e) => dispatch(setFilters({ priority: e.target.value }))}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  >
                    <option value="">All</option>
                    <option value="urgent">Urgent</option>
                    <option value="high">High</option>
                    <option value="normal">Normal</option>
                    <option value="low">Low</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    value={filters.category}
                    onChange={(e) => dispatch(setFilters({ category: e.target.value }))}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  >
                    <option value="">All</option>
                    {labels.map(label => (
                      <option key={label.name} value={label.name}>{label.name}</option>
                    ))}
                  </select>
                </div>
                <div className="flex-1"></div>
                <button
                  onClick={() => {
                    dispatch(clearFilters());
                    setShowFilters(false);
                  }}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          )}
        </header>

        {/* Error Display */}
        {error && (
          <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2 text-red-800">
              <AlertTriangle size={16} />
              <span className="text-sm font-medium">Error: {error}</span>
            </div>
          </div>
        )}

        {/* Toolbar */}
        {selectedMessages.length > 0 && (
          <div className="bg-blue-50 border-b border-blue-200 px-6 py-3">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-blue-700">
                {selectedMessages.length} selected
              </span>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => handleBulkAction('markRead')}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Eye size={14} />
                  Mark Read
                </button>
                <button 
                  onClick={() => handleBulkAction('markUnread')}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <EyeOff size={14} />
                  Mark Unread
                </button>
                <button 
                  onClick={() => handleBulkAction('star')}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Star size={14} />
                  Star
                </button>
                <button 
                  onClick={() => handleBulkAction('archive')}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Archive size={14} />
                  Archive
                </button>
                <button 
                  onClick={() => handleBulkAction('delete')}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Trash2 size={14} />
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Messages List */}
        <div className="flex-1 overflow-auto">
          {loading && messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <RefreshCw className="w-8 h-8 mx-auto mb-4 text-blue-600 animate-spin" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Loading messages...</h3>
              </div>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <Mail className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No messages
                </h3>
                <p className="text-gray-500">
                  There are no messages in this folder.
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-white mx-6 mt-4 rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              {/* Table Header */}
              <div className="bg-gray-50 border-b border-gray-200 px-6 py-3">
                <div className="flex items-center gap-4">
                  <input
                    type="checkbox"
                    checked={
                      selectedMessages.length === messages.length &&
                      messages.length > 0
                    }
                    onChange={handleSelectAllMessages}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    {messages.filter((m) => m.unread).length} unread
                  </span>
                  {pagination.totalMessages > 0 && (
                    <span className="text-sm text-gray-500">
                      Showing {messages.length} of {pagination.totalMessages}
                    </span>
                  )}
                </div>
              </div>

              {/* Messages */}
              <div className="divide-y divide-gray-200">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`group flex items-center gap-4 px-6 py-4 hover:bg-gray-50 cursor-pointer transition-all duration-200 ${
                      msg.unread ? "bg-blue-25 border-l-4 border-l-blue-200" : ""
                    } ${
                      selectedMessages.includes(msg.id)
                        ? "bg-blue-50 border-l-4 border-l-blue-500"
                        : ""
                    }`}
                    onClick={() => handleMessageClick(msg)}
                  >
                    <input
                      type="checkbox"
                      checked={selectedMessages.includes(msg.id)}
                      onChange={(e) => handleMessageSelection(msg.id, e)}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                    />

                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      {/* Avatar */}
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-medium text-sm flex-shrink-0">
                        {msg.avatar}
                      </div>

                      {/* Content */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className={`font-semibold text-gray-900 truncate ${
                              msg.unread ? "font-bold" : ""
                            }`}
                          >
                            {msg.sender}
                          </span>
                          {msg.important && (
                            <Star
                              size={14}
                              className="text-yellow-500 fill-current flex-shrink-0"
                            />
                          )}
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium text-white ${getTagColor(
                              msg.tag
                            )} flex-shrink-0`}
                          >
                            {msg.tag}
                          </span>
                          {msg.priority && msg.priority !== 'normal' && (
                            <span className={`text-xs px-1.5 py-0.5 rounded ${getPriorityColor(msg.priority)} bg-opacity-10 flex-shrink-0`}>
                              {msg.priority.toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div
                          className={`text-gray-900 mb-1 truncate ${
                            msg.unread ? "font-semibold" : ""
                          }`}
                        >
                          {msg.subject}
                        </div>
                        <div className="text-sm text-gray-500 truncate">
                          {msg.preview}
                        </div>
                      </div>

                      {/* Time and Actions */}
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <div className="text-right">
                          <div className="text-sm text-gray-500">
                            {msg.time}
                          </div>
                          {msg.date !== 'Today' && (
                            <div className="text-xs text-gray-400">
                              {msg.date}
                            </div>
                          )}
                        </div>
                        <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity">
                          <button
                            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleReplyMessage(msg);
                            }}
                            title="Reply"
                          >
                            <Reply size={16} />
                          </button>
                          <button
                            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStarMessage(msg.id, msg.starred);
                            }}
                            title="Star"
                          >
                            <Star size={16} className={msg.starred ? "fill-yellow-500 text-yellow-500" : ""} />
                          </button>
                          <button
                            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            onClick={(e) => e.stopPropagation()}
                            title="More options"
                          >
                            <MoreHorizontal size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">
                      Page {pagination.currentPage} of {pagination.totalPages}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => dispatch(getMessages({ 
                          folder: activeFolder, 
                          page: pagination.currentPage - 1,
                          search: searchQuery,
                          ...filters 
                        }))}
                        disabled={!pagination.hasPrev}
                        className="px-3 py-1 text-sm text-gray-600 bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Previous
                      </button>
                      <button
                        onClick={() => dispatch(getMessages({ 
                          folder: activeFolder, 
                          page: pagination.currentPage + 1,
                          search: searchQuery,
                          ...filters 
                        }))}
                        disabled={!pagination.hasNext}
                        className="px-3 py-1 text-sm text-gray-600 bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Modals */}
      <ComposeModal 
        isOpen={composeModal.show} 
        onClose={() => dispatch(hideComposeModal())} 
      />
      <ReplyModal 
        message={replyingToMessage} 
        isOpen={showReplyModal} 
        onClose={() => setShowReplyModal(false)} 
      />
    </div>
  );
};

export default Inbox;