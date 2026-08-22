import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:provider/provider.dart';
import '../../core/routes/app_routes.dart';
import '../../core/theme/app_colors.dart';
import '../../services/auth_service.dart';
import '../../services/society_service.dart';
import '../../shared/widgets/app_card.dart';
import '../../shared/widgets/grade_badge.dart';
import 'society_settings_details.dart';

class SocietySettingsScreen extends StatefulWidget {
  const SocietySettingsScreen({super.key});

  @override
  State<SocietySettingsScreen> createState() => _SocietySettingsScreenState();
}

class _SocietySettingsScreenState extends State<SocietySettingsScreen> {
  // Pickup Preferences
  String _defaultTimeSlot = '09:00 AM - 11:00 AM';
  bool _wetOrganic = true;
  bool _dryRecyclables = true;
  bool _eWaste = false;

  // Forecast Preferences (STRICTLY NO AUTO-CONFIRM OPTION!)
  bool _forecastNotifs = true;
  bool _forecastReminder = true;
  bool _eventForecasts = true;

  // Notification Switches
  bool _pickupNotifs = true;
  bool _driverNotifs = true;
  bool _completionNotifs = true;
  bool _processingNotifs = true;
  bool _rewardNotifs = false;
  bool _systemAlerts = true;

  // Reminders
  bool _reminder24h = true;
  bool _driverArrivalReminder = true;

  // Appearance & Language
  String _themeMode = 'LIGHT';
  final String _selectedLanguage = 'English (US)';

  // Permissions Mock
  bool _locPermission = true;
  bool _notifPermission = true;
  bool _camPermission = false;

  void _showLogoutDialog() {
    showDialog(
      context: context,
      builder: (ctx) {
        return AlertDialog(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
          title: Row(
            children: const [
              Icon(LucideIcons.logOut, color: AppColors.dangerText),
              SizedBox(width: 8),
              Text('Confirm Logout', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w800)),
            ],
          ),
          content: const Text(
            'Are you sure you want to log out of your UrbanEco-Link RWA session?',
            style: TextStyle(fontSize: 13, color: AppColors.neutralDark),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(ctx),
              child: const Text('Cancel', style: TextStyle(color: AppColors.neutralGray)),
            ),
            ElevatedButton(
              style: ElevatedButton.styleFrom(backgroundColor: AppColors.dangerText),
              onPressed: () {
                Navigator.pop(ctx);
                context.read<AuthService>().logout();
                Navigator.pushNamedAndRemoveUntil(context, AppRoutes.login, (r) => false);
              },
              child: const Text('LOGOUT', style: TextStyle(fontWeight: FontWeight.w800)),
            ),
          ],
        );
      },
    );
  }

  void _showDeactivateDialog() {
    final confirmController = TextEditingController();

    showDialog(
      context: context,
      builder: (ctx) {
        return StatefulBuilder(
          builder: (context, setDialogState) {
            return AlertDialog(
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
              title: Row(
                children: const [
                  Icon(LucideIcons.alertTriangle, color: AppColors.dangerText),
                  SizedBox(width: 8),
                  Text('Deactivate Society Account', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w900)),
                ],
              ),
              content: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'WARNING: Account deactivation suspends automated AI waste forecasting and municipal SWM compliance credits for this RWA.',
                    style: TextStyle(fontSize: 12, color: AppColors.neutralDark),
                  ),
                  const SizedBox(height: 14),
                  const Text('Type DELETE to confirm deactivation:', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: AppColors.dangerText)),
                  const SizedBox(height: 6),
                  TextField(
                    controller: confirmController,
                    decoration: InputDecoration(
                      hintText: 'DELETE',
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                      contentPadding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                    ),
                    onChanged: (_) => setDialogState(() {}),
                  ),
                ],
              ),
              actions: [
                TextButton(
                  onPressed: () => Navigator.pop(ctx),
                  child: const Text('Cancel', style: TextStyle(color: AppColors.neutralGray)),
                ),
                ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: confirmController.text.trim() == 'DELETE' ? AppColors.dangerText : AppColors.borderGray,
                  ),
                  onPressed: confirmController.text.trim() == 'DELETE'
                      ? () {
                          Navigator.pop(ctx);
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(content: Text('Society deactivation request submitted to municipal administrator.'), backgroundColor: AppColors.dangerText),
                          );
                        }
                      : null,
                  child: const Text('DEACTIVATE', style: TextStyle(fontWeight: FontWeight.w800)),
                ),
              ],
            );
          },
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final societyService = context.watch<SocietyService>();
    final tg = societyService.trustGrade;

    return Scaffold(
      backgroundColor: AppColors.bgSlate,
      appBar: AppBar(
        title: const Text('Settings'),
        leading: IconButton(
          icon: const Icon(LucideIcons.arrowLeft),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.only(left: 16.0, right: 16.0, top: 16.0, bottom: 80.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // TOP PROFILE HEADER CARD
            AppCard(
              backgroundColor: Colors.white,
              borderColor: AppColors.primary,
              child: Row(
                children: [
                  GradeBadge(grade: tg.grade, size: 48),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: const [
                        Text('Greenwood Heights RWA', maxLines: 1, overflow: TextOverflow.ellipsis, style: TextStyle(fontSize: 16, fontWeight: FontWeight.w900, color: AppColors.neutralDark)),
                        SizedBox(height: 2),
                        Text('Society ID: SOC-9021 • Sector 62', maxLines: 1, overflow: TextOverflow.ellipsis, style: TextStyle(fontSize: 12, color: AppColors.neutralGray)),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),

            // ACCOUNT SETTINGS
            _SectionHeader(title: 'Account Settings'),
            AppCard(
              padding: EdgeInsets.zero,
              child: Column(
                children: [
                  _SettingsTile(
                    icon: LucideIcons.user,
                    title: 'Personal Information',
                    subtitle: 'Anil Kumar • Representative',
                    onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const PersonalInformationScreen())),
                  ),
                  const Divider(height: 1),
                  _SettingsTile(
                    icon: LucideIcons.building2,
                    title: 'Society Information',
                    subtitle: '450 Households • Plot 4, Sector 62',
                    onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const SocietyInformationScreen())),
                  ),
                  const Divider(height: 1),
                  _SettingsTile(
                    icon: LucideIcons.lock,
                    title: 'Change Password',
                    subtitle: 'Update account credentials',
                    onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const ChangePasswordScreen())),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),

            // PICKUP PREFERENCES
            _SectionHeader(title: 'Pickup Preferences'),
            AppCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  ListTile(
                    contentPadding: EdgeInsets.zero,
                    leading: const Icon(LucideIcons.clock, color: AppColors.primary, size: 20),
                    title: const Text('Default Pickup Window', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w700)),
                    subtitle: Text(_defaultTimeSlot, style: const TextStyle(fontSize: 12, color: AppColors.neutralGray)),
                    trailing: const Icon(LucideIcons.chevronRight, size: 18, color: AppColors.neutralGray),
                    onTap: () async {
                      final selected = await showDialog<String>(
                        context: context,
                        builder: (ctx) => SimpleDialog(
                          title: const Text('Select Default Pickup Time'),
                          children: [
                            SimpleDialogOption(onPressed: () => Navigator.pop(ctx, '07:00 AM - 09:00 AM'), child: const Text('07:00 AM - 09:00 AM')),
                            SimpleDialogOption(onPressed: () => Navigator.pop(ctx, '09:00 AM - 11:00 AM'), child: const Text('09:00 AM - 11:00 AM')),
                            SimpleDialogOption(onPressed: () => Navigator.pop(ctx, '11:00 AM - 01:00 PM'), child: const Text('11:00 AM - 01:00 PM')),
                          ],
                        ),
                      );
                      if (selected != null) setState(() => _defaultTimeSlot = selected);
                    },
                  ),
                  const Divider(),
                  const Text('Preferred Waste Categories', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: AppColors.neutralDark)),
                  const SizedBox(height: 6),

                  _CategoryCheckboxRow(label: 'Wet Organic Waste', value: _wetOrganic, onChanged: (v) => setState(() => _wetOrganic = v)),
                  _CategoryCheckboxRow(label: 'Dry Recyclables', value: _dryRecyclables, onChanged: (v) => setState(() => _dryRecyclables = v)),
                  _CategoryCheckboxRow(label: 'Hazardous & E-Waste', value: _eWaste, onChanged: (v) => setState(() => _eWaste = v)),
                ],
              ),
            ),
            const SizedBox(height: 20),

            // FORECAST PREFERENCES (STRICTLY NO AUTO-CONFIRM OPTION!)
            _SectionHeader(title: 'AI Forecast & Confirmation Rules'),
            AppCard(
              child: Column(
                children: [
                  SwitchListTile(
                    dense: true,
                    contentPadding: EdgeInsets.zero,
                    title: const Text('AI Forecast Notifications', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w700)),
                    subtitle: const Text('Receive 24-hour advance volume estimates', style: TextStyle(fontSize: 11, color: AppColors.neutralGray)),
                    value: _forecastNotifs,
                    activeThumbColor: AppColors.primary,
                    onChanged: (v) => setState(() => _forecastNotifs = v),
                  ),
                  const Divider(),
                  SwitchListTile(
                    dense: true,
                    contentPadding: EdgeInsets.zero,
                    title: const Text('24h Confirmation Reminder', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w700)),
                    subtitle: const Text('Prompt RWA to verify payload before batching', style: TextStyle(fontSize: 11, color: AppColors.neutralGray)),
                    value: _forecastReminder,
                    activeThumbColor: AppColors.primary,
                    onChanged: (v) => setState(() => _forecastReminder = v),
                  ),
                  const Divider(),
                  SwitchListTile(
                    dense: true,
                    contentPadding: EdgeInsets.zero,
                    title: const Text('Event Surge Predictions', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w700)),
                    subtitle: const Text('Special forecasts during Diwali/Holi holidays', style: TextStyle(fontSize: 11, color: AppColors.neutralGray)),
                    value: _eventForecasts,
                    activeThumbColor: AppColors.primary,
                    onChanged: (v) => setState(() => _eventForecasts = v),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),

            // NOTIFICATIONS & REMINDERS
            _SectionHeader(title: 'Notification & Reminder Center'),
            AppCard(
              child: Column(
                children: [
                  SwitchListTile(
                    dense: true,
                    contentPadding: EdgeInsets.zero,
                    title: const Text('Pickup Status Updates', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w700)),
                    value: _pickupNotifs,
                    activeThumbColor: AppColors.primary,
                    onChanged: (v) => setState(() => _pickupNotifs = v),
                  ),
                  SwitchListTile(
                    dense: true,
                    contentPadding: EdgeInsets.zero,
                    title: const Text('Driver Arrival & Proximity Alerts', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w700)),
                    value: _driverNotifs,
                    activeThumbColor: AppColors.primary,
                    onChanged: (v) => setState(() => _driverNotifs = v),
                  ),
                  SwitchListTile(
                    dense: true,
                    contentPadding: EdgeInsets.zero,
                    title: const Text('Pickup Completion Proof', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w700)),
                    value: _completionNotifs,
                    activeThumbColor: AppColors.primary,
                    onChanged: (v) => setState(() => _completionNotifs = v),
                  ),
                  SwitchListTile(
                    dense: true,
                    contentPadding: EdgeInsets.zero,
                    title: const Text('Factory Intake & Processing Log', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w700)),
                    value: _processingNotifs,
                    activeThumbColor: AppColors.primary,
                    onChanged: (v) => setState(() => _processingNotifs = v),
                  ),
                  SwitchListTile(
                    dense: true,
                    contentPadding: EdgeInsets.zero,
                    title: const Text('Rewards & Eco-Credits Offers', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w700)),
                    value: _rewardNotifs,
                    activeThumbColor: AppColors.primary,
                    onChanged: (v) => setState(() => _rewardNotifs = v),
                  ),
                  SwitchListTile(
                    dense: true,
                    contentPadding: EdgeInsets.zero,
                    title: const Text('24h Forecast Advance Reminder', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w700)),
                    value: _reminder24h,
                    activeThumbColor: AppColors.primary,
                    onChanged: (v) => setState(() => _reminder24h = v),
                  ),
                  SwitchListTile(
                    dense: true,
                    contentPadding: EdgeInsets.zero,
                    title: const Text('Driver Proximity Reminder', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w700)),
                    value: _driverArrivalReminder,
                    activeThumbColor: AppColors.primary,
                    onChanged: (v) => setState(() => _driverArrivalReminder = v),
                  ),
                  SwitchListTile(
                    dense: true,
                    contentPadding: EdgeInsets.zero,
                    title: const Text('Important System & Safety Alerts', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w700)),
                    subtitle: const Text('Required for operational safety', style: TextStyle(fontSize: 11, color: AppColors.neutralGray)),
                    value: _systemAlerts,
                    activeThumbColor: AppColors.primary,
                    onChanged: (v) => setState(() => _systemAlerts = v),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),

            // REWARDS & SUSTAINABILITY
            _SectionHeader(title: 'Rewards & Sustainability Grade'),
            AppCard(
              padding: EdgeInsets.zero,
              child: Column(
                children: [
                  _SettingsTile(
                    icon: LucideIcons.award,
                    title: 'UrbanEco Grade & Trust Score',
                    subtitle: 'Grade A+ • Trust Score 94/100',
                    onTap: () => Navigator.pushNamed(context, AppRoutes.societyTrustGrade),
                  ),
                  const Divider(height: 1),
                  _SettingsTile(
                    icon: LucideIcons.coins,
                    title: 'Eco-Credits & Municipal Vouchers',
                    subtitle: '1,250 PTS Balance Available',
                    onTap: () => Navigator.pushNamed(context, AppRoutes.societyRewards),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),

            // APP PREFERENCES & PERMISSIONS
            _SectionHeader(title: 'App Preferences & Permissions'),
            AppCard(
              child: Column(
                children: [
                  ListTile(
                    contentPadding: EdgeInsets.zero,
                    leading: const Icon(LucideIcons.moon, color: AppColors.primary, size: 20),
                    title: const Text('Theme Mode', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w700)),
                    subtitle: Text(_themeMode == 'LIGHT' ? 'Follow System (Light Default)' : 'Dark Mode'),
                    onTap: () {
                      setState(() => _themeMode = _themeMode == 'LIGHT' ? 'DARK' : 'LIGHT');
                    },
                  ),
                  const Divider(),
                  ListTile(
                    contentPadding: EdgeInsets.zero,
                    leading: const Icon(LucideIcons.globe, color: AppColors.primary, size: 20),
                    title: const Text('App Language', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w700)),
                    subtitle: Text(_selectedLanguage, style: const TextStyle(fontSize: 12, color: AppColors.neutralGray)),
                    onTap: () {},
                  ),
                  const Divider(),
                  SwitchListTile(
                    dense: true,
                    contentPadding: EdgeInsets.zero,
                    title: const Text('Location Access Permission', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w700)),
                    subtitle: Text(_locPermission ? 'Allowed' : 'Not Allowed', style: const TextStyle(fontSize: 11, color: AppColors.neutralGray)),
                    value: _locPermission,
                    activeThumbColor: AppColors.primary,
                    onChanged: (v) => setState(() => _locPermission = v),
                  ),
                  SwitchListTile(
                    dense: true,
                    contentPadding: EdgeInsets.zero,
                    title: const Text('Notification Permission', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w700)),
                    subtitle: Text(_notifPermission ? 'Allowed' : 'Not Allowed', style: const TextStyle(fontSize: 11, color: AppColors.neutralGray)),
                    value: _notifPermission,
                    activeThumbColor: AppColors.primary,
                    onChanged: (v) => setState(() => _notifPermission = v),
                  ),
                  SwitchListTile(
                    dense: true,
                    contentPadding: EdgeInsets.zero,
                    title: const Text('Camera Permission', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w700)),
                    subtitle: Text(_camPermission ? 'Allowed' : 'Not Allowed', style: const TextStyle(fontSize: 11, color: AppColors.neutralGray)),
                    value: _camPermission,
                    activeThumbColor: AppColors.primary,
                    onChanged: (v) => setState(() => _camPermission = v),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),

            // HELP, LEGAL & PLATFORM INFO
            _SectionHeader(title: 'Help, Legal & Platform Info'),
            AppCard(
              padding: EdgeInsets.zero,
              child: Column(
                children: [
                  _SettingsTile(
                    icon: LucideIcons.helpCircle,
                    title: 'Report a Problem',
                    subtitle: 'Submit support ticket to helpline',
                    onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const ReportProblemScreen())),
                  ),
                  const Divider(height: 1),
                  _SettingsTile(
                    icon: LucideIcons.info,
                    title: 'About UrbanEco-Link',
                    subtitle: 'Version 1.0.0 (Build 2026.08)',
                    onTap: () {},
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),

            // LOGOUT & ACCOUNT DEACTIVATION ACTIONS
            SizedBox(
              width: double.infinity,
              height: 46,
              child: OutlinedButton.icon(
                style: OutlinedButton.styleFrom(
                  foregroundColor: AppColors.dangerText,
                  side: const BorderSide(color: AppColors.dangerBorder),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(30)),
                ),
                icon: const Icon(LucideIcons.logOut, size: 18),
                label: const Text('Logout Session', style: TextStyle(fontWeight: FontWeight.w800)),
                onPressed: _showLogoutDialog,
              ),
            ),
            const SizedBox(height: 10),
            Center(
              child: TextButton(
                onPressed: _showDeactivateDialog,
                child: const Text('Deactivate Society Account', style: TextStyle(color: AppColors.neutralGray, fontSize: 12, decoration: TextDecoration.underline)),
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

class _CategoryCheckboxRow extends StatelessWidget {
  final String label;
  final bool value;
  final ValueChanged<bool> onChanged;

  const _CategoryCheckboxRow({
    required this.label,
    required this.value,
    required this.onChanged,
  });

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: () => onChanged(!value),
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 6),
        child: Row(
          children: [
            Expanded(
              child: Text(
                label,
                style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: AppColors.neutralDark),
              ),
            ),
            SizedBox(
              height: 24,
              width: 24,
              child: Checkbox(
                value: value,
                activeColor: AppColors.primary,
                onChanged: (v) {
                  if (v != null) onChanged(v);
                },
              ),
            ),
          ],
        ),
      ),
    );
  }
}
