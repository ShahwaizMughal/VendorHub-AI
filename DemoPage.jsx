import React, { useState } from 'react';
import { Button, Input, Card, CardHeader, CardTitle, Badge, Modal } from '../components/ui';
import { Navbar } from '../components/layout/Navbar';
import { Sidebar } from '../components/layout/Sidebar';
import { ChatBox } from '../components/chat/ChatBox';
import { NotificationDropdown } from '../components/notifications/NotificationDropdown';

export const DemoPage = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 flex flex-col">
      <Navbar user={{ name: 'Maryam' }} />

      <div className="flex flex-1">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

        <main className="flex-1 p-6 space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">Design System & UI Components Demo</h1>
            <div className="flex items-center gap-3">
              <NotificationDropdown />
              <Button onClick={() => setIsModalOpen(true)}>Open Test Modal</Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Component Showcase Card */}
            <Card>
              <CardHeader>
                <CardTitle>UI Components Preview</CardTitle>
              </CardHeader>
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <Badge variant="success">Success</Badge>
                  <Badge variant="warning">Warning</Badge>
                  <Badge variant="danger">Danger</Badge>
                  <Badge variant="info">Info</Badge>
                </div>

                <div className="flex gap-2">
                  <Button variant="primary">Primary</Button>
                  <Button variant="secondary">Secondary</Button>
                  <Button variant="outline">Outline</Button>
                </div>

                <Input label="Test Input Field" placeholder="Type something..." />
              </div>
            </Card>

            {/* Chat System Preview */}
            <ChatBox recipientName="Shahwaiz Akram" />
          </div>
        </main>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Test Modal Title"
      >
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Yeh aapka modal component kaam kar raha hai!
        </p>
        <div className="mt-4 flex justify-end">
          <Button onClick={() => setIsModalOpen(false)}>Close</Button>
        </div>
      </Modal>
    </div>
  );
};

export default DemoPage;