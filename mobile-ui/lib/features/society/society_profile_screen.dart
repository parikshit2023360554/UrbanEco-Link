import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:provider/provider.dart';
import '../../core/routes/app_routes.dart';
import '../../core/theme/app_colors.dart';
import '../../services/auth_service.dart';
import '../../services/society_service.dart';
import '../../shared/widgets/app_button.dart';
import '../../shared/widgets/app_card.dart';

class SocietyProfileScreen extends StatelessWidget {
  const SocietyProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthService>();
    final societyService = context.watch<SocietyService>();
    final user = auth.currentUser;
    final tg = societyService.trustGrade;

    return Scaffold(
      backgroundColor: AppColors.bgSlate,
      appBar: AppBar(
        title: const Text('Society Profile'),
        actions: [
          IconButton(
            icon: const Icon(LucideIcons.settings, color: AppColors.neutralDark),
            onPressed: () => Navigator.pushNamed(context, AppRoutes.societySettings),
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.only(left: 16.0, right: 16.0, top: 16.0, bottom: 80.0),
        child: Column(
          children: [
            // SOCIETY IDENTITY CARD
            AppCard(
              child: Column(
                children: [
                  const CircleAvatar(
                    radius: 26,
                    backgroundColor: AppColors.primaryLight,
                    child: Icon(LucideIcons.building2, size: 24, color: AppColors.primary),
                  ),
                  const SizedBox(height: 10),
                  Text(
                    user?.name ?? 'Greenwood Heights RWA',
                    textAlign: TextAlign.center,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w700, color: AppColors.neutralDark),
                  ),
                  const SizedBox(height: 2),
                  const Text(
                    'Society ID: SOC-9021 • Sector 62, Eco City',
                    textAlign: TextAlign.center,
                    style: TextStyle(fontSize: 12, color: AppColors.neutralGray),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 14),

            // KEY METRICS CARD
            AppCard(
              child: Row(
                children: [
                  Expanded(
                    child: _MetricColumn(value: '${tg.score}/100', label: 'Trust Score'),
                  ),
                  Container(width: 1, height: 28, color: AppColors.borderLight),
                  Expanded(
                    child: _MetricColumn(value: '${tg.segregationAccuracyPercent}%', label: 'Segregation'),
                  ),
                  Container(width: 1, height: 28, color: AppColors.borderLight),
                  Expanded(
                    child: const _MetricColumn(value: '450', label: 'Households'),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 14),

            // SOCIETY SETTINGS CARD
            AppCard(
              onTap: () => Navigator.pushNamed(context, AppRoutes.societySettings),
              backgroundColor: AppColors.primaryLight.withValues(alpha: 0.4),
              borderColor: AppColors.primary,
              child: Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(8),
                    decoration: const BoxDecoration(
                      color: AppColors.primary,
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(LucideIcons.settings, color: Colors.white, size: 18),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: const [
                        Text(
                          'Society Settings & Preferences',
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: AppColors.neutralDark),
                        ),
                        SizedBox(height: 2),
                        Text(
                          'Account, Pickup preferences,\nNotifications & Reminders',
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                          style: TextStyle(fontSize: 11, color: AppColors.neutralGray, height: 1.3),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(width: 8),
                  const Icon(LucideIcons.chevronRight, color: AppColors.primary, size: 18),
                ],
              ),
            ),
            const SizedBox(height: 14),

            // REGISTERED YARD & CONTACT INFO CARD
            AppCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: const [
                  Text(
                    'Registered Yard & Contact Info',
                    style: TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: AppColors.neutralDark),
                  ),
                  SizedBox(height: 12),

                  _ResponsiveDetailBlock(label: 'Collection Yard', value: 'Gate 2 Main Waste Enclosure'),
                  Divider(height: 16),

                  _ResponsiveDetailBlock(label: 'RWA Representative', value: 'Anil Kumar (President)'),
                  Divider(height: 16),

                  _ResponsiveDetailBlock(label: 'Contact Phone', value: '+91 98765 43210'),
                  Divider(height: 16),

                  _ResponsiveDetailBlock(label: 'SWM 2026 License', value: 'MUNI-SWM-2026-9021'),
                ],
              ),
            ),
            const SizedBox(height: 16),

            // PRIMARY ACTION BUTTON
            AppButton(
              label: 'Open Full Society Settings',
              icon: LucideIcons.settings,
              height: 46,
              onPressed: () => Navigator.pushNamed(context, AppRoutes.societySettings),
            ),
          ],
        ),
      ),
    );
  }
}

class _MetricColumn extends StatelessWidget {
  final String value;
  final String label;

  const _MetricColumn({required this.value, required this.label});

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Text(
          value,
          maxLines: 1,
          overflow: TextOverflow.ellipsis,
          style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w800, color: AppColors.primary),
        ),
        const SizedBox(height: 2),
        Text(
          label,
          maxLines: 1,
          overflow: TextOverflow.ellipsis,
          style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w500, color: AppColors.neutralGray),
        ),
      ],
    );
  }
}

class _ResponsiveDetailBlock extends StatelessWidget {
  final String label;
  final String value;

  const _ResponsiveDetailBlock({required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: AppColors.neutralGray),
        ),
        const SizedBox(height: 2),
        Text(
          value,
          style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: AppColors.neutralDark),
        ),
      ],
    );
  }
}
