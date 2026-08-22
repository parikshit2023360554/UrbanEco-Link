import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:provider/provider.dart';
import '../../core/routes/app_routes.dart';
import '../../core/theme/app_colors.dart';
import '../../services/auth_service.dart';
import '../../shared/widgets/app_button.dart';
import '../../shared/widgets/app_card.dart';

class DriverProfileScreen extends StatelessWidget {
  const DriverProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthService>();
    final user = auth.currentUser;

    return Scaffold(
      backgroundColor: AppColors.bgSlate,
      appBar: AppBar(
        title: const Text('Driver Profile'),
        actions: [
          IconButton(
            icon: const Icon(LucideIcons.settings),
            onPressed: () => Navigator.pushNamed(context, AppRoutes.driverSettings),
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          children: [
            AppCard(
              child: Column(
                children: [
                  const CircleAvatar(
                    radius: 40,
                    backgroundColor: AppColors.primaryLight,
                    child: Icon(LucideIcons.truck, size: 40, color: AppColors.primary),
                  ),
                  const SizedBox(height: 12),
                  Text(
                    user?.name ?? 'Vikram Singh',
                    style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w900, color: AppColors.neutralDark),
                  ),
                  const SizedBox(height: 2),
                  const Text('Logistics Operator • EV Fleet', style: TextStyle(fontSize: 12, color: AppColors.neutralGray)),
                  const Divider(height: 24),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceAround,
                    children: const [
                      _ProfileMetric(title: 'Rating', value: '4.9 ★'),
                      _ProfileMetric(title: 'Jobs Done', value: '342'),
                      _ProfileMetric(title: 'On-Time %', value: '98.5%'),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),

            AppCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Vehicle Parameters', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w800, color: AppColors.neutralDark)),
                  const SizedBox(height: 12),
                  _DetailRow(label: 'Registration Number', value: 'KA-01-EV-2026'),
                  const Divider(height: 16),
                  _DetailRow(label: 'Vehicle Category', value: 'EV Heavy Payload Hauler'),
                  const Divider(height: 16),
                  _DetailRow(label: 'Gross Capacity Rating', value: '1,500 kg'),
                ],
              ),
            ),
            const SizedBox(height: 20),

            AppButton(
              label: 'Driver Settings & Preferences',
              icon: LucideIcons.settings,
              type: AppButtonType.outline,
              onPressed: () => Navigator.pushNamed(context, AppRoutes.driverSettings),
            ),
          ],
        ),
      ),
    );
  }
}

class _ProfileMetric extends StatelessWidget {
  final String title;
  final String value;
  const _ProfileMetric({required this.title, required this.value});

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Text(value, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w900, color: AppColors.primary)),
        Text(title, style: const TextStyle(fontSize: 11, color: AppColors.neutralGray)),
      ],
    );
  }
}

class _DetailRow extends StatelessWidget {
  final String label;
  final String value;
  const _DetailRow({required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(label, style: const TextStyle(fontSize: 12, color: AppColors.neutralGray)),
        Text(value, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w800, color: AppColors.neutralDark)),
      ],
    );
  }
}
