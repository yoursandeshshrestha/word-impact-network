// src/app/test-messaging/page.tsx
import DummyMessageSender from "@/src/components/DummyMessageSender";
import WebSocketMonitor from "@/src/components/WebSocketMonitor";

export default function TestMessagingPage() {
  return (
    <div className="container mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-6 text-center">
        WebSocket Testing Page
      </h1>
      <p className="text-center mb-8 text-gray-600">
        Use this page to test WebSocket notifications between student and admin
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DummyMessageSender />
        <WebSocketMonitor />
      </div>

      <div className="mt-8 p-4 bg-blue-50 rounded-lg text-sm text-blue-800">
        <h3 className="font-bold mb-2">How to test:</h3>
        <ol className="list-decimal pl-5 space-y-2">
          <li>Make sure your backend server is running</li>
          <li>Check that the WebSocket Monitor shows Connected status</li>
          <li>
            Type a test message in the message sender and click Send Test
            Message
          </li>
          <li>Verify that your admin panel shows the message notification</li>
          <li>
            If the WebSocket is working correctly, you should see new message
            events in the WebSocket Monitor
          </li>
        </ol>
      </div>
    </div>
  );
}
