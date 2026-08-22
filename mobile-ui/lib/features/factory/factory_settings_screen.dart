import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:provider/provider.dart';
import '../../core/routes/app_routes.dart';
import '../../core/theme/app_colors.dart';
import '../../services/auth_service.dart';
import '../../services/factory_service.dart';
import '../../shared/widgets/app_card.dart';

class FactorySettingsScreen extends StatefulWidget {
  const FactorySettingsScreen({super.key});

  @override
  State<FactorySettingsScreen> createState() => _FactorySettingsScreenState();
}

class _FactorySettingsScreenState extends State<FactorySettingsScreen> {
  bool _dailyCapacityReminder = true;
  bool _incomingShipmentAlerts = true;
  bool _maintenanceAlerts = true;
  TimeOfDay _reminderTime = const TimeOfDay(hour: 7, minute: 30);

  @override
  Widget build(BuildContext context) {
    final auth = context.read<AuthService>();
    final factoryService = context.watch<FactoryService>();
    final cap = factoryService.capacity;

    return Scaffold(
      backgroundColor: AppColors.bgSlate,
      appBar: AppBar(
        title: const Text('Factory Profile & Configuration'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Facility Information
            _SectionHeader(title: 'Facility & Operations Profile'),
            AppCard(
              padding: EdgeInsets.zero,
              child: Column(
                children: [
                  _SettingsTile(
                    icon: LucideIcons.factory,
                    title: 'Factory Information',
                    subtitle: 'EcoMatrix Bio-Recycling Facility #4',
                    onTap: () {},
                  ),
                  const Divider(height: 1),
                  _SettingsTile(
                    icon: LucideIcons.mapPin,
                    title: 'Location & Weighbridge Gate',
                    subtitle: 'Industrial Zone Sector 18, Gate 4',
                    onTap: () {},
                  ),
                  const Divider(height: 1),
                  _SettingsTile(
                    icon: LucideIcons.layers,
                    title: 'Accepted Waste Streams',
                    subtitle: 'Wet Organic, Dry Recyclables, E-Waste',
                    onTap: () {},
                  ),
                  const Divider(height: 1),
                  _SettingsTile(
                    icon: LucideIcons.clock,
                    title: 'Operating Shift Hours',
                    subtitle: '24/7 Continuous Processing Operation',
                    onTap: () {},
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),

            // Capacity & Daily Reminder Settings
            _SectionHeader(title: 'Capacity & Daily Reminder Settings'),
            AppCard(
              child: Column(
                children: [
                  _SettingsTile(
                    icon: LucideIcons.gauge,
                    title: 'Maximum Plant Rating',
                    subtitle: '${cap.maxCapacityKg.toStringAsFixed(0)} kg / Day',
                    onTap: () {},
                  ),
                  const Divider(height: 1),
                  SwitchListTile(
                    title: const Text('Daily Available Capacity Reminder', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w700)),
                    subtitle: const Text("Prompt manager every morning to update today's capacity", style: TextStyle(fontSize: 12, color: AppColors.neutralGray)),
                    value: _dailyCapacityReminder,
                    activeColor: AppColors.primary,
                    onChanged: (val) => setState(() => _dailyCapacityReminder = val),
                  ),
                  const Divider(),
                  ListTile(
                    leading: const Icon(LucideIcons.alarmClock, color: AppColors.primary, size: 20),
                    title: const Text('Reminder Schedule Time', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w700)),
                    subtitle: Text('${_reminderTime.format(context)} Daily', style: const TextStyle(fontSize: 12, color: AppColors.neutralGray)),
                    trailing: const Icon(LucideIcons.chevronRight, size: 18, color: AppColors.neutralGray),
                    onTap: () async {
                      final picked = await showTimePicker(context: context, initialTime: _reminderTime);
                      if (picked != null) setState(() => _reminderTime = picked);
                    },
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),

            // Operational Preferences & Staff
            _SectionHeader(title: 'Notifications & Maintenance Preferences'),
            AppCard(
              child: Column(
                children: [
                  SwitchListTile(
                    title: const Text('Incoming Truck Alerts', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w700)),
                    subtitle: const Text('Notify when driver enters 5km geofence radius', style: TextStyle(fontSize: 12, color: AppColors.neutralGray)),
                    value: _incomingShipmentAlerts,
                    activeColor: AppColors.primary,
                    onChanged: (val) => setState(() => _incomingShipmentAlerts = val),
                  ),
                  const Divider(),
                  SwitchListTile(
                    title: const Text('Maintenance Downtime Alerts', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w700)),
                    subtitle: const Text('Notify logistics engine on conveyor maintenance', style: TextStyle(fontSize: 12, color: AppColors.neutralGray)),
                    value: _maintenanceAlerts,
                    activeColor: AppColors.primary,
                    onChanged: (val) => setState(() => _maintenanceAlerts = val),
                  ),
                  const Divider(height: 1),
                  _SettingsTile(
                    icon: LucideIcons.users,
                    title: 'Plant Staff & Operators',
                    subtitle: '12 Shift Engineers & Operators',
                    onTap: () {},
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),

            // Security & Legal
            _SectionHeader(title: 'Security & System'),
            AppCard(
              padding: EdgeInsets.zero,
              child: Column(
                children: [
                  _SettingsTile(
                    icon: LucideIcons.shieldCheck,
                    title: 'Security & Access Protocols',
                    subtitle: 'Manager API tokens & weighbridge locks',
                    onTap: () {},
                  ),
                  const Divider(height: 1),
                  _SettingsTile(
                    icon: LucideIcons.helpCircle,
                    title: 'Support & Emergency Helpline',
                    subtitle: 'Factory Control Room • +91 1800-FACTORY-HQ',
                    onTap: () {},
                  ),
                  const Divider(height: 1),
                  _SettingsTile(
                    icon: LucideIcons.info,
                    title: 'About Factory Engine',
                    subtitle: 'Version 1.0.0 (Capacity & Intake Engine)',
                    onTap: () {},
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),

            // Logout Button
            SizedBox(
              width: double.infinity,
              height: 48,
              child: OutlinedButton.icon(
                style: OutlinedButton.styleFrom(
                  foregroundColor: AppColors.dangerText,
                  side: const BorderSide(color: AppColors.dangerBorder),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(30)),
                ),
                icon: const Icon(LucideIcons.logOut, size: 18),
                label: const Text('Logout Factory Manager Session', style: TextStyle(fontWeight: FontWeight.w800)),
                onPressed: () {
                  auth.logout();
                  Navigator.pushNamedAndRemoveUntil(context, AppRoutes.login, (r) => false);
                },
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _SectionHeader extends StatelessWidget {
  final String title;
  const _SectionHeader({required this.title});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(left: 4, bottom: 8),
      child: Text(
        title.toUpperCase(),
        style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w800, color: AppColors.neutralGray, letterSpacing: 0.6),
      ),
    );
  }
}

class _SettingsTile extends StatelessWidget {
  final IconData icon;
  final String title;
  final String subtitle;
  final VoidCallback onTap;

  const _SettingsTile({
    required this.icon,
    required this.title,
    required this.subtitle,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return ListTile(
      leading: Icon(icon, color: AppColors.primary, size: 20),
      title: Text(title, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: AppColors.neutralDark)),
      subtitle: Text(subtitle, style: const TextStyle(fontSize: 12, color: AppColors.neutralGray)),
      trailing: const Icon(LucideIcons.chevronRight, size: 18, color: AppColors.neutralGray),
      onTap: onTap,
    );
  }
}
