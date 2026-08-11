import { Link } from 'react-router-dom';
import AccountSidebar from '../components/AccountSidebar';

const ORDERS = [
  { id: 'MC-8492', date: 'Oct 12, 2024', total: 145.00, items: 3, status: 'Pending', statusColor: 'bg-surface-container border border-outline-variant text-on-surface-variant' },
  { id: 'MC-8310', date: 'Sep 28, 2024', total: 85.50, items: 2, status: 'Shipped', statusColor: 'bg-primary-container text-on-primary-container' },
  { id: 'MC-7901', date: 'Aug 05, 2024', total: 210.00, items: 4, status: 'Delivered', statusColor: 'bg-surface-container-highest text-on-surface' },
];

export default function MyAccount() {
  return (
    <main className="flex-grow flex flex-col md:flex-row w-full max-w-[1400px] mx-auto px-4 sm:px-8 md:px-12 py-12 gap-8">
      {/* Unified Account Sidebar */}
      <AccountSidebar />

      {/* Main Content Area */}
      <section className="flex-grow">
        <div className="mb-6">
          <h1 className="font-headline-md-mobile md:font-headline-md text-headline-md-mobile md:text-headline-md text-primary mb-1">
            Order History
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Review your past purchases and track current orders.
          </p>
        </div>

        {/* Bento Card & Table */}
        <div className="bg-surface-container-lowest rounded-xl shadow-ambient p-6 md:p-8 overflow-hidden border border-outline-variant/30 space-y-6">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="border-b-2 border-primary/20">
                  <th className="py-3 px-4 font-label-md text-label-md text-on-surface-variant">Order ID</th>
                  <th className="py-3 px-4 font-label-md text-label-md text-on-surface-variant">Date</th>
                  <th className="py-3 px-4 font-label-md text-label-md text-on-surface-variant">Total</th>
                  <th className="py-3 px-4 font-label-md text-label-md text-on-surface-variant">Status</th>
                  <th className="py-3 px-4 font-label-md text-label-md text-on-surface-variant text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20">
                {ORDERS.map((order) => (
                  <tr key={order.id} className="group hover:bg-surface-container-low transition-colors duration-200">
                    <td className="py-4 px-4 font-body-md text-body-md text-on-surface font-medium">#{order.id}</td>
                    <td className="py-4 px-4 font-body-md text-body-md text-on-surface-variant">{order.date}</td>
                    <td className="py-4 px-4 font-body-md text-body-md text-on-surface font-bold">${order.total.toFixed(2)}</td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full font-label-sm text-label-sm ${order.statusColor}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <Link
                        to="/account/track"
                        className="text-primary hover:text-on-primary-container font-label-md text-label-md transition-colors"
                      >
                        Track Order
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Support Note Box */}
          <div className="p-6 bg-surface-container-low rounded-lg border border-primary-fixed-dim/30 flex items-start gap-4">
            <span className="material-symbols-outlined text-primary text-2xl mt-0.5">favorite</span>
            <div className="space-y-1">
              <h4 className="font-title-sm text-title-sm text-primary">Need help with an order?</h4>
              <p className="font-body-md text-body-md text-on-surface-variant text-sm">
                Our customer care team is here to assist you with any questions regarding your handcrafted pieces.
              </p>
              <Link
                to="/contact"
                className="inline-block mt-2 text-primary border-b border-primary font-label-md text-label-md pb-0.5 hover:opacity-80 transition-opacity"
              >
                Contact Support
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
