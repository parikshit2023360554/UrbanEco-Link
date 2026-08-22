import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:provider/provider.dart';
import '../../core/routes/app_routes.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_spacing.dart';
import '../../core/theme/app_typography.dart';
import '../../services/auth_service.dart';
import '../../services/driver_service.dart';
import '../../shared/widgets/app_button.dart';
import '../../shared/widgets/app_card.dart';
import '../../shared/widgets/screen_layout.dart';
import '../../shared/widgets/status_badge.dart';

class DriverDashboardScreen extends StatelessWidget {
  const DriverDashboardScreen({super.key});

  String _greeting() {
    final hour = DateTime.now().hour;
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  }

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthService>();
    final driverService = context.watch<DriverService>();
    final user = auth.currentUser;
    final assignments = driverService.assignments;
    final active = driverService.activeAssignment;

    final totalPayload =
        assignments.fold<double>(0, (sum, a) => sum + a.totalWeightKg);

    return Scaffold(
      backgroundColor: AppColors.bgSlate,
      body: SafeArea(
        child: SingleChildScrollView(
          physics: const BouncingScrollPhysics(),
          padding: const EdgeInsets.fromLTRB(
            AppSpacing.screenPadding,
            AppSpacing.lg,
            AppSpacing.screenPadding,
            AppSpacing.bottomNavPadding,
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              ScreenHeader(
                title: '${_greeting()},\n${user?.name ?? 'Driver'}',
                subtitle: 'KA-01-EV-2026 · EV Logistics',
                trailing: _HeaderIconButton(
                  icon: LucideIcons.qrCode,
                  onTap: () =>
                      Navigator.pushNamed(context, AppRoutes.driverQrScanner),
                ),
              ),
              const SizedBox(height: AppSpacing.xl),

              // Quick actions
              GridView.count(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                crossAxisCount: 3,
                mainAxisSpacing: AppSpacing.sm,
                crossAxisSpacing: AppSpacing.sm,
                childAspectRatio: AppSpacing.quickActionAspectRatio,
                children: [
                  QuickActionTile(
                    icon: LucideIcons.qrCode,
                    label: 'Scan QR',
                    onTap: () =>
                        Navigator.pushNamed(context, AppRoutes.driverQrScanner),
                  ),
                  QuickActionTile(
                    icon: LucideIcons.truck,
                    label: 'Assignments',
                    onTap: () => Navigator.pushNamed(
                      context,
                      AppRoutes.driverAssignments,
                    ),
                  ),
                  QuickActionTile(
                    icon: LucideIcons.history,
                    label: 'History',
                    onTap: () =>
                        Navigator.pushNamed(context, AppRoutes.driverHistory),
                  ),
                ],
              ),
              const SizedBox(height: AppSpacing.xl),

              HighlightBanner(
                icon: LucideIcons.map,
                title: '${assignments.length} pickups today',
                subtitle: '${totalPayload.toStringAsFixed(0)} kg total payload',
              ),
              const SizedBox(height: AppSpacing.xl),

              // Active assignment
              if (active != null) ...[
                const SectionHeader(title: 'Current job'),
                const SizedBox(height: AppSpacing.md),
                AppCard(
                  borderColor: AppColors.primary.withValues(alpha: 0.4),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          StatusBadge.streamCategory(active.streamCategory),
                          const Spacer(),
                          StatusBadge.pickupStatus(active.status),
                        ],
                      ),
                      const SizedBox(height: AppSpacing.lg),
                      Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Container(
                            padding: const EdgeInsets.all(8),
                            decoration: BoxDecoration(
                              color: AppColors.primaryLight,
                              borderRadius: BorderRadius.circular(10),
                            ),
                            child: const Icon(
                              LucideIcons.mapPin,
                              size: 18,
                              color: AppColors.primary,
                            ),
                          ),
                          const SizedBox(width: AppSpacing.md),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  active.originSociety,
                                  style: const TextStyle(
                                    fontSize: AppTypography.body,
                                    fontWeight: FontWeight.w700,
                                    color: AppColors.neutralDark,
                                  ),
                                ),
                                const SizedBox(height: 2),
                                Text(
                                  active.pickupAddress,
                                  style: AppTypography.bodySmallStyle,
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: AppSpacing.lg),
                      Row(
                        children: [
                          _MetaChip(
                            label: 'Weight',
                            value: '${active.totalWeightKg.toStringAsFixed(0)} kg',
                          ),
                          const SizedBox(width: AppSpacing.sm),
                          _MetaChip(
                            label: 'ETA',
                            value: active.etaMinutes,
                          ),
                          const SizedBox(width: AppSpacing.sm),
                          _MetaChip(
                            label: 'Priority',
                            value: active.priority,
                          ),
                        ],
                      ),
                      const SizedBox(height: AppSpacing.md),
                      Container(
                        width: double.infinity,
                        padding: const EdgeInsets.all(AppSpacing.md),
                        decoration: BoxDecoration(
                          color: AppColors.bgSlate,
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Row(
                          children: [
                            const Icon(
                              LucideIcons.factory,
                              size: 16,
                              color: AppColors.neutralGray,
                            ),
                            const SizedBox(width: AppSpacing.sm),
                            Expanded(
                              child: Text(
                                active.destinationFactoryName,
                                style: const TextStyle(
                                  fontSize: 13,
                                  fontWeight: FontWeight.w600,
                                  color: AppColors.neutralDark,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: AppSpacing.lg),
                      AppButton(
                        label: 'Scan & verify pickup',
                        icon: LucideIcons.qrCode,
                        height: 40,
                        onPressed: () => Navigator.pushNamed(
                          context,
                          AppRoutes.driverQrScanner,
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: AppSpacing.xl),
              ],

              SectionHeader(
                title: "Today's schedule",
                actionLabel: 'View all',
                onAction: () =>
                    Navigator.pushNamed(context, AppRoutes.driverAssignments),
              ),
              const SizedBox(height: AppSpacing.md),

              if (assignments.isEmpty)
                const AppCard(
                  hasShadow: false,
                  child: Padding(
                    padding: EdgeInsets.symmetric(vertical: 24),
                    child: Center(
                      child: Text(
                        'No assignments scheduled for today.',
                        style: AppTypography.bodySmallStyle,
                      ),
                    ),
                  ),
                )
              else
                ...assignments.map(
                  (item) => ListItemCard(
                    icon: LucideIcons.mapPin,
                    title: item.originSociety,
                    subtitle:
                        '${item.streamCategory} · ${item.totalWeightKg.toStringAsFixed(0)} kg',
                    trailing: StatusBadge.pickupStatus(item.status),
                  ),
                ),
            ],
          ),
        ),
      ),
    );
  }
}

class _HeaderIconButton extends StatelessWidget {
  final IconData icon;
  final VoidCallback onTap;

  const _HeaderIconButton({required this.icon, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return Material(
      color: AppColors.primaryLight,
      borderRadius: BorderRadius.circular(14),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(14),
        child: SizedBox(
          width: AppSpacing.minTouchTarget,
          height: AppSpacing.minTouchTarget,
          child: Icon(icon, size: 18, color: AppColors.primary),
        ),
      ),
    );
  }
}

class _MetaChip extends StatelessWidget {
  final String label;
  final String value;

  const _MetaChip({required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.symmetric(
          horizontal: AppSpacing.sm,
          vertical: AppSpacing.sm,
        ),
        decoration: BoxDecoration(
          color: AppColors.bgSlate,
          borderRadius: BorderRadius.circular(10),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              label,
              style: const TextStyle(
                fontSize: AppTypography.caption,
                color: AppColors.neutralGray,
              ),
            ),
            Text(
              value,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: const TextStyle(
                fontSize: AppTypography.bodySmall,
                fontWeight: FontWeight.w700,
                color: AppColors.neutralDark,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
