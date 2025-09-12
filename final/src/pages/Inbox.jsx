import { useState } from "react";
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
} from "lucide-react";

const messages = [
  {
    id: 1,
    sender: "Jullu Jalal",
    subject: "Our Bachelor of Commerce Program - Application Deadline Extended",
    preview:
      "We're excited to inform you that the application deadline has been extended...",
    content: `Dear Student,

We're excited to inform you that the application deadline for our Bachelor of Commerce Program has been extended to give more students the opportunity to join our prestigious program.

Key Program Highlights:
• Comprehensive curriculum covering all aspects of commerce
• Industry partnerships and internship opportunities  
• Expert faculty with real-world experience
• Modern facilities and resources

The new deadline is March 15th, 2024. Don't miss this opportunity to secure your future in commerce.

For any questions, please contact our admissions office.

Best regards,
Jullu Jalal
Admissions Director`,
    tag: "Primary",
    time: "8:38 AM",
    date: "Today",
    unread: true,
    important: false,
    starred: false,
    avatar: "JJ",
    email: "jullu.jalal@university.edu",
  },
  {
    id: 2,
    sender: "Minerva Barnett",
    subject: "Get Best Advertiser Rates - Limited Time Offer",
    preview:
      "Don't miss out on our exclusive advertising packages with up to 40% savings...",
    content: `Hello,

Don't miss out on our exclusive advertising packages with up to 40% savings on all premium ad placements.

Our packages include:
• Premium placement on high-traffic websites
• Social media advertising campaigns
• Email marketing solutions
• Analytics and reporting tools

This limited-time offer expires soon. Contact us today to secure these incredible rates.

Best regards,
Minerva Barnett
Marketing Director`,
    tag: "Work",
    time: "8:13 AM",
    date: "Today",
    unread: false,
    important: true,
    starred: true,
    avatar: "MB",
    email: "minerva.barnett@adcompany.com",
  },
  {
    id: 3,
    sender: "Design Team",
    subject: "Weekly Design Review - Please Review Attached Mockups",
    preview:
      "Hi team, please review the latest UI mockups for the dashboard redesign...",
    content: `Hi Team,

Please review the latest UI mockups for the dashboard redesign project. We've made significant improvements based on last week's feedback.

Changes made:
• Improved navigation structure
• Better color contrast for accessibility
• Streamlined user flows
• Updated typography system

Please provide your feedback by Friday so we can proceed with development.

Thanks,
Design Team`,
    tag: "Work",
    time: "7:45 AM",
    date: "Today",
    unread: true,
    important: false,
    starred: false,
    avatar: "DT",
    email: "design@company.com",
  },
];

const allMessages = {
  inbox: messages,
  starred: messages.filter((m) => m.starred),
  sent: [
    {
      id: 101,
      sender: "You",
      subject: "Re: Project Update Required",
      preview: "Thanks for the update. I've reviewed the documents...",
      content:
        "Thanks for the update. I've reviewed the documents and everything looks good to proceed.",
      tag: "Work",
      time: "2:30 PM",
      date: "Yesterday",
      unread: false,
      important: false,
      starred: false,
      avatar: "YU",
      email: "you@company.com",
    },
  ],
  draft: [
    {
      id: 201,
      sender: "Draft",
      subject: "Meeting agenda for next week",
      preview: "Here's the proposed agenda for our upcoming meeting...",
      content: "Here's the proposed agenda for our upcoming meeting...",
      tag: "Work",
      time: "Draft",
      date: "Draft",
      unread: false,
      important: false,
      starred: false,
      avatar: "DR",
      email: "",
    },
  ],
  spam: [],
  important: messages.filter((m) => m.important),
  bin: [],
};

const sidebarItems = [
  { id: "inbox", icon: Mail, label: "Inbox", count: allMessages.inbox.length },
  {
    id: "starred",
    icon: Star,
    label: "Starred",
    count: allMessages.starred.length,
  },
  { id: "sent", icon: Send, label: "Sent", count: allMessages.sent.length },
  {
    id: "draft",
    icon: FileText,
    label: "Draft",
    count: allMessages.draft.length,
  },
  {
    id: "spam",
    icon: AlertTriangle,
    label: "Spam",
    count: allMessages.spam.length,
  },
  {
    id: "important",
    icon: Mail,
    label: "Important",
    count: allMessages.important.length,
  },
  { id: "bin", icon: Trash2, label: "Bin", count: allMessages.bin.length },
];

const labels = [
  { name: "Primary", color: "bg-cyan-500", textColor: "text-cyan-700" },
  { name: "Social", color: "bg-blue-500", textColor: "text-blue-700" },
  { name: "Work", color: "bg-purple-500", textColor: "text-purple-700" },
  { name: "Friends", color: "bg-pink-500", textColor: "text-pink-700" },
];

const Inbox = () => {
  const [activeView, setActiveView] = useState("inbox");
  const [selectedMessages, setSelectedMessages] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [openMessage, setOpenMessage] = useState(null);

  const currentMessages = allMessages[activeView] || [];

  const toggleMessageSelection = (id, e) => {
    e.stopPropagation();
    setSelectedMessages((prev) =>
      prev.includes(id) ? prev.filter((msgId) => msgId !== id) : [...prev, id]
    );
  };

  const openMessageView = (message) => {
    setOpenMessage(message);
    // Mark as read
    if (message.unread) {
      // In a real app, you'd update this in your state management
      message.unread = false;
    }
  };

  const closeMessage = () => {
    setOpenMessage(null);
  };

  const toggleAll = () => {
    setSelectedMessages((prev) =>
      prev.length === currentMessages.length
        ? []
        : currentMessages.map((m) => m.id)
    );
  };

  const getTagColor = (tag) => {
    const label = labels.find((l) => l.name === tag);
    return label ? label.color : "bg-gray-500";
  };

  const getViewTitle = () => {
    const item = sidebarItems.find((item) => item.id === activeView);
    return item ? item.label : "Inbox";
  };

  // Message detail view
  if (openMessage) {
    return (
      <div className="flex h-screen bg-gray-50">
        {/* Sidebar */}
        <aside className="w-72 bg-white shadow-lg border-r border-gray-200">
          <div className="p-6">
            <button className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105">
              <Plus size={18} />
              Compose
            </button>
          </div>

          <nav className="px-3">
            <ul className="space-y-1">
              {sidebarItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeView === item.id;
                return (
                  <li key={item.id}>
                    <button
                      onClick={() => {
                        setActiveView(item.id);
                        setSelectedMessages([]);
                        closeMessage();
                      }}
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
                onClick={closeMessage}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft size={20} />
              </button>
              <div className="flex-1">
                <h1 className="text-xl font-semibold text-gray-900">
                  {openMessage.subject}
                </h1>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                  <Archive size={18} />
                </button>
                <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
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
                    {openMessage.avatar}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {openMessage.sender}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {openMessage.email}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">
                          {openMessage.date}
                        </p>
                        <p className="text-sm text-gray-500">
                          {openMessage.time}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium text-white ${getTagColor(
                          openMessage.tag
                        )}`}
                      >
                        {openMessage.tag}
                      </span>
                      {openMessage.important && (
                        <Star
                          size={14}
                          className="text-yellow-500 fill-current"
                        />
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Message Body */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="prose max-w-none">
                  <div className="whitespace-pre-line text-gray-700 leading-relaxed">
                    {openMessage.content}
                  </div>
                </div>
              </div>

              {/* Reply Actions */}
              <div className="flex items-center gap-3 mt-6">
                <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  <Reply size={16} />
                  Reply
                </button>
                <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                  <Forward size={16} />
                  Forward
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main inbox view
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-72 bg-white shadow-lg border-r border-gray-200">
        <div className="p-6">
          <button className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105">
            <Plus size={18} />
            Compose
          </button>
        </div>

        <nav className="px-3">
          <ul className="space-y-1">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeView === item.id;
              return (
                <li key={item.id}>
                  <button
                    onClick={() => {
                      setActiveView(item.id);
                      setSelectedMessages([]);
                    }}
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

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">
              {getViewTitle()}
            </h1>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={18}
                />
                <input
                  type="text"
                  placeholder="Search messages..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-80"
                />
              </div>
            </div>
          </div>
        </header>

        {/* Toolbar */}
        {selectedMessages.length > 0 && (
          <div className="bg-blue-50 border-b border-blue-200 px-6 py-3">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-blue-700">
                {selectedMessages.length} selected
              </span>
              <div className="flex items-center gap-2">
                <button className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                  <Archive size={14} />
                  Archive
                </button>
                <button className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                  <Trash2 size={14} />
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Messages List */}
        <div className="flex-1 overflow-auto">
          {currentMessages.length === 0 ? (
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
                      selectedMessages.length === currentMessages.length &&
                      currentMessages.length > 0
                    }
                    onChange={toggleAll}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    {currentMessages.filter((m) => m.unread).length} unread
                  </span>
                </div>
              </div>

              {/* Messages */}
              <div className="divide-y divide-gray-200">
                {currentMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`group flex items-center gap-4 px-6 py-4 hover:bg-gray-50 cursor-pointer transition-all duration-200 ${
                      msg.unread ? "bg-blue-25" : ""
                    } ${
                      selectedMessages.includes(msg.id)
                        ? "bg-blue-50 border-l-4 border-l-blue-500"
                        : ""
                    }`}
                    onClick={() => openMessageView(msg)}
                  >
                    <input
                      type="checkbox"
                      checked={selectedMessages.includes(msg.id)}
                      onChange={(e) => toggleMessageSelection(msg.id, e)}
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
                            className={`font-semibold text-gray-900 ${
                              msg.unread ? "font-bold" : ""
                            }`}
                          >
                            {msg.sender}
                          </span>
                          {msg.important && (
                            <Star
                              size={14}
                              className="text-yellow-500 fill-current"
                            />
                          )}
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium text-white ${getTagColor(
                              msg.tag
                            )}`}
                          >
                            {msg.tag}
                          </span>
                        </div>
                        <div
                          className={`text-gray-900 mb-1 ${
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
                        <span className="text-sm text-gray-500">
                          {msg.time}
                        </span>
                        <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity">
                          <button
                            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Reply size={16} />
                          </button>
                          <button
                            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Forward size={16} />
                          </button>
                          <button
                            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MoreHorizontal size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Inbox;
