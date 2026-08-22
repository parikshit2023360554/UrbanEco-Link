import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:provider/provider.dart';
import '../../core/routes/app_routes.dart';
import '../../core/theme/app_colors.dart';
import '../../services/auth_service.dart';
import '../../shared/widgets/app_card.dart';

class DriverSettingsScreen extends StatefulWidget {
  const DriverSettingsScreen({super.key});

  @override
  State<DriverSettingsScreen> createState() => _DriverSettingsScreenState();
}

class _DriverSettingsScreenState extends State<DriverSettingsScreen> {
  bool _isAvailable = true;
  bool _assignmentNotifs = true;
  bool _emergencyAlerts = true;

  @override
  Widget build(BuildContext context) {
    final auth = context.read<AuthService>();

    return Scaffold(
      backgroundColor: AppColors.bgSlate,
      appBar: AppBar(
        title: const Text('Driver & Vehicle Settings'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Vehicle & Duty Availability
            _SectionHeader(title: 'Duty Availability & Vehicle'),
            AppCard(
              child: Column(
                children: [
                  SwitchListTile(
                    title: const Text('On-Duty Availability', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w700)),
                    subtitle: const Text('Active to receive logistics assignments', style: TextStyle(fontSize: 12, color: AppColors.neutralGray)),
                    value: _isAvailable,
                    activeColor: AppColors.primary,
                    onChanged: (val) => setState(() => _isAvailable = val),
                  ),
                  const Divider(),
                  _SettingsTile(
                    icon: LucideIcons.truck,
                    title: 'Vehicle Specs & Registration',
                    subtitle: 'EV Logistics Heavy Hauler • KA-01-EV-2026',
                    onTap: () {},
                  ),
                  const Divider(height: 1),
                  _SettingsTile(
                    icon: LucideIcons.scale,
                    title: 'Payload Capacity Rating',
                    subtitle: '1,500 kg Maximum Gross Payload',
                    onTap: () {},
                  ),
                  const Divider(height: 1),
                  _SettingsTile(
                    icon: LucideIcons.clock,
                    title: 'Shift & Working Hours',
                    subtitle: '07:00 AM - 05:00 PM (Day Shift)',
                    onTap: () {},
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),

            // Navigation & Dispatch Preferences
            _SectionHeader(title: 'Navigation & Notifications'),
            AppCard(
              child: Column(
                children: [
                  SwitchListTile(
                    title: const Text('New Assignment Alerts', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w700)),
                    subtitle: const Text('Sound & vibration for dispatch notifications', style: TextStyle(fontSize: 12, color: AppColors.neutralGray)),
                    value: _assignmentNotifs,
                    activeColor: AppColors.primary,
                    onChanged: (val) => setState(() => _assignmentNotifs = val),
                  ),
                  const Divider(),
                  SwitchListTile(
                    title: const Text('Emergency Broadcast Alerts', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w700)),
                    subtitle: const Text('Factory shutdown & route hazard alerts', style: TextStyle(fontSize: 12, color: AppColors.neutralGray)),
                    value: _emergencyAlerts,
                    activeColor: AppColors.primary,
                    onChanged: (val) => setState(() => _emergencyAlerts = val),
                  ),
                  const Divider(height: 1),
                  _SettingsTile(
                    icon: LucideIcons.navigation,
                    title: 'Navigation App Default',
                    subtitle: 'Internal Route Map Engine',
                    onTap: () {},
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),

            // Safety, Emergency & Support
            _SectionHeader(title: 'Safety & System'),
            AppCard(
              padding: EdgeInsets.zero,
              child: Column(
                children: [
                  _SettingsTile(
                    icon: LucideIcons.phoneCall,
                    title: 'Emergency Contact & SOS Info',
                    subtitle: 'Logistics Control Room • +91 1800-ECO-DISPATCH',
                    onTap: () {},
                  ),
                  const Divider(height: 1),
                  _SettingsTile(
                    icon: LucideIcons.helpCircle,
                    title: 'Driver Support Helpline',
                    subtitle: '24/7 Logistics Helpdesk',
                    onTap: () {},
                  ),
                  const Divider(height: 1),
                  _SettingsTile(
                    icon: LucideIcons.info,
                    title: 'About Driver App',
                    subtitle: 'Version 1.0.0 (Logistics Engine)',
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
                label: const Text('Logout Driver Session', style: TextStyle(fontWeight: FontWeight.w800)),
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
