import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../../core/theme/app_colors.dart';
import '../models/models.dart';
import 'app_card.dart';

class NotificationCenterScreen extends StatefulWidget {
  const NotificationCenterScreen({super.key});

  @override
  State<NotificationCenterScreen> createState() => _NotificationCenterScreenState();
}

class _NotificationCenterScreenState extends State<NotificationCenterScreen> {
  String _selectedTab = 'ALL';

  final List<AppNotificationModel> _notifications = [
    AppNotificationModel(
      id: 'NOTIF-01',
      title: 'AI Forecast Ready for Confirmation',
      message: 'Predicted payload of 450kg Wet Organic Waste for Greenwood Heights RWA.',
      type: 'FORECAST',
      timestamp: '10 mins ago',
      isRead: false,
    ),
    AppNotificationModel(
      id: 'NOTIF-02',
      title: 'Driver Assigned to Pickup #PU-9001',
      message: 'Vikram Singh (EV KA-01-EV-2026) is en route to Gate 2.',
      type: 'DRIVER',
      timestamp: '1 hour ago',
      isRead: false,
    ),
    AppNotificationModel(
      id: 'NOTIF-03',
      title: 'Factory Daily Capacity Reminder',
      message: "Please update EcoMatrix Facility #4 today's available capacity.",
      type: 'CAPACITY',
      timestamp: '2 hours ago',
      isRead: true,
    ),
    AppNotificationModel(
      id: 'NOTIF-04',
      title: 'Batch Processing Completed',
      message: 'Batch #BATCH-WET-889 processed with 93.1% material recovery rate.',
      type: 'PROCESSING',
      timestamp: 'Yesterday',
      isRead: true,
    ),
  ];

  @override
  Widget build(BuildContext context) {
    final filtered = _notifications.where((n) {
      if (_selectedTab == 'UNREAD') return !n.isRead;
      if (_selectedTab == 'IMPORTANT') return n.type == 'FORECAST' || n.type == 'ALERT' || n.type == 'CAPACITY';
      return true;
    }).toList();

    return Scaffold(
      backgroundColor: AppColors.bgSlate,
      appBar: AppBar(
        title: const Text('Notification Center'),
        actions: [
          TextButton(
            onPressed: () {
              setState(() {
                for (var n in _notifications) {
                  n.isRead = true;
                }
              });
            },
            child: const Text('Mark All Read', style: TextStyle(color: AppColors.primary, fontWeight: FontWeight.w700)),
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.only(left: 16.0, right: 16.0, top: 16.0, bottom: 80.0),
        child: Column(
          children: [
            // Filter Pills Row
            SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              child: Row(
                children: [
                  _TabChip(
                    label: 'All (${_notifications.length})',
                    isSelected: _selectedTab == 'ALL',
                    onTap: () => setState(() => _selectedTab = 'ALL'),
                  ),
                  const SizedBox(width: 8),
                  _TabChip(
                    label: 'Unread (${_notifications.where((n) => !n.isRead).length})',
                    isSelected: _selectedTab == 'UNREAD',
                    onTap: () => setState(() => _selectedTab = 'UNREAD'),
                  ),
                  const SizedBox(width: 8),
                  _TabChip(
                    label: 'Important',
                    isSelected: _selectedTab == 'IMPORTANT',
                    onTap: () => setState(() => _selectedTab = 'IMPORTANT'),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),

            if (filtered.isEmpty)
              const AppCard(
                child: Center(
                  child: Padding(
                    padding: EdgeInsets.all(24.0),
                    child: Text('No notifications match this filter.'),
                  ),
                ),
              )
            else
              ListView.builder(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                itemCount: filtered.length,
                itemBuilder: (context, index) {
                  final item = filtered[index];
                  return AppCard(
                    margin: const EdgeInsets.only(bottom: 10),
                    backgroundColor: item.isRead ? Colors.white : AppColors.primaryLight.withOpacity(0.3),
                    child: Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        _getNotificationIcon(item.type),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                children: [
                                  Expanded(
                                    child: Text(
                                      item.title,
                                      style: TextStyle(
                                        fontSize: 14,
                                        fontWeight: item.isRead ? FontWeight.w700 : FontWeight.w900,
                                        color: AppColors.neutralDark,
                                      ),
                                    ),
                                  ),
                                  Text(
                                    item.timestamp,
                                    style: const TextStyle(fontSize: 10, color: AppColors.neutralGray),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 4),
                              Text(
                                item.message,
                                style: const TextStyle(fontSize: 12, color: AppColors.neutralGray, height: 1.3),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  );
                },
              ),
          ],
        ),
      ),
    );
  }

  Widget _getNotificationIcon(String type) {
    IconData icon;
    Color color;

    switch (type) {
      case 'FORECAST':
        icon = LucideIcons.sparkles;
        color = AppColors.primary;
        break;
      case 'DRIVER':
        icon = LucideIcons.truck;
        color = AppColors.infoText;
        break;
      case 'CAPACITY':
        icon = LucideIcons.gauge;
        color = AppColors.warningText;
        break;
      case 'PROCESSING':
        icon = LucideIcons.recycle;
        color = AppColors.primary;
        break;
      default:
        icon = LucideIcons.bell;
        color = AppColors.neutralDark;
    }

    return Container(
      padding: const EdgeInsets.all(8),
      decoration: BoxDecoration(
        color: color.withOpacity(0.12),
        shape: BoxShape.circle,
      ),
      child: Icon(icon, size: 18, color: color),
    );
  }
}

class _TabChip extends StatelessWidget {
  final String label;
  final bool isSelected;
  final VoidCallback onTap;

  const _TabChip({required this.label, required this.isSelected, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(20),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
        decoration: BoxDecoration(
          color: isSelected ? AppColors.primary : Colors.white,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: isSelected ? AppColors.primary : AppColors.borderGray),
        ),
        child: Text(
          label,
          style: TextStyle(
            fontSize: 12,
            fontWeight: FontWeight.w700,
            color: isSelected ? Colors.white : AppColors.neutralDark,
          ),
        ),
      ),
    );
  }
}
