import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:provider/provider.dart';
import '../../core/constants/app_constants.dart';
import '../../core/routes/app_routes.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_spacing.dart';
import '../../core/theme/app_typography.dart';
import '../../services/auth_service.dart';
import '../../services/factory_service.dart';
import '../../shared/widgets/app_button.dart';
import '../../shared/widgets/app_card.dart';
import '../../shared/widgets/screen_layout.dart';
import '../../shared/widgets/status_badge.dart';
import 'widgets/capacity_reminder_card.dart';

class FactoryDashboardScreen extends StatelessWidget {
  const FactoryDashboardScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthService>();
    final factoryService = context.watch<FactoryService>();
    final user = auth.currentUser;
    final cap = factoryService.capacity;
    final statusConfig = factoryService.statusConfig;
    final incoming = factoryService.incomingBatches;

    final usedPercent = cap.maxCapacityKg > 0
        ? ((cap.maxCapacityKg - cap.remainingCapacityKg) / cap.maxCapacityKg *
                100)
            .clamp(0, 100)
        : 0.0;

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
                title: user?.name ?? 'EcoMatrix Facility',
                subtitle: 'Bio-composting & recycling plant',
                trailing: GestureDetector(
                  onTap: () => Navigator.pushNamed(
                    context,
                    AppRoutes.factoryStatusControls,
                  ),
                  child: StatusBadge.factoryStatus(statusConfig.status),
                ),
              ),
              const SizedBox(height: AppSpacing.xl),

              if (statusConfig.status == AppConstants.statusEmergency) ...[
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(AppSpacing.lg),
                  decoration: BoxDecoration(
                    color: AppColors.statusEmergencyBg,
                    borderRadius: BorderRadius.circular(16),
                  ),
                  child: const Row(
                    children: [
                      Icon(
                        LucideIcons.alertOctagon,
                        color: Colors.white,
                        size: 22,
                      ),
                      SizedBox(width: AppSpacing.md),
                      Expanded(
                        child: Text(
                          'Emergency shutdown active. No new batches accepted.',
                          style: TextStyle(
                            color: Colors.white,
                            fontSize: AppTypography.bodySmall,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: AppSpacing.lg),
              ],

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
                    label: 'Receive Batch',
                    onTap: () => Navigator.pushNamed(
                      context,
                      AppRoutes.factoryProcessing,
                    ),
                  ),
                  QuickActionTile(
                    icon: LucideIcons.gauge,
                    label: 'Capacity',
                    onTap: () => Navigator.pushNamed(
                      context,
                      AppRoutes.factoryCapacity,
                    ),
                  ),
                  QuickActionTile(
                    icon: LucideIcons.sliders,
                    label: 'Controls',
                    iconBgColor: AppColors.warningBg,
                    iconColor: AppColors.warningText,
                    onTap: () => Navigator.pushNamed(
                      context,
                      AppRoutes.factoryStatusControls,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: AppSpacing.xl),

              const DailyCapacityReminderCard(),
              const SizedBox(height: AppSpacing.lg),

              // Capacity overview
              AppCard(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Processing capacity',
                      style: AppTypography.sectionTitleStyle,
                    ),
                    const SizedBox(height: AppSpacing.lg),
                    ClipRRect(
                      borderRadius: BorderRadius.circular(8),
                      child: LinearProgressIndicator(
                        value: usedPercent / 100,
                        minHeight: 10,
                        backgroundColor: AppColors.primaryLight,
                        valueColor: AlwaysStoppedAnimation<Color>(
                          usedPercent > 85
                              ? AppColors.dangerText
                              : AppColors.primary,
                        ),
                      ),
                    ),
                    const SizedBox(height: AppSpacing.sm),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          '${usedPercent.toStringAsFixed(0)}% used',
                          style: AppTypography.bodySmallStyle,
                        ),
                        Text(
                          'Max ${cap.maxCapacityKg.toStringAsFixed(0)} kg',
                          style: AppTypography.bodySmallStyle,
                        ),
                      ],
                    ),
                    const SizedBox(height: AppSpacing.lg),
                    Row(
                      children: [
                        Expanded(
                          child: _CapacityStatBox(
                            title: 'Available today',
                            value:
                                '${cap.todayAvailableCapacityKg.toStringAsFixed(0)} kg',
                            color: AppColors.primary,
                            bgColor: AppColors.primaryLight,
                          ),
                        ),
                        const SizedBox(width: AppSpacing.md),
                        Expanded(
                          child: _CapacityStatBox(
                            title: 'Remaining',
                            value:
                                '${cap.remainingCapacityKg.toStringAsFixed(0)} kg',
                            color: AppColors.infoText,
                            bgColor: AppColors.infoBg,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              const SizedBox(height: AppSpacing.xl),

              SectionHeader(
                title: 'En route (${incoming.length})',
                actionLabel: 'View queue',
                onAction: () => Navigator.pushNamed(
                  context,
                  AppRoutes.factoryIncomingBatches,
                ),
              ),
              const SizedBox(height: AppSpacing.md),

              if (incoming.isEmpty)
                const AppCard(
                  hasShadow: false,
                  child: Padding(
                    padding: EdgeInsets.symmetric(vertical: 24),
                    child: Center(
                      child: Text(
                        'No trucks en route right now.',
                        style: AppTypography.bodySmallStyle,
                      ),
                    ),
                  ),
                )
              else
                ...incoming.take(3).map(
                      (item) => AppCard(
                        margin: const EdgeInsets.only(bottom: AppSpacing.sm),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              children: [
                                StatusBadge.streamCategory(
                                  item.streamCategory,
                                ),
                                const Spacer(),
                                Text(
                                  'ETA ${item.etaMinutes}',
                                  style: const TextStyle(
                                    fontSize: AppTypography.bodySmall,
                                    fontWeight: FontWeight.w600,
                                    color: AppColors.primary,
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: AppSpacing.md),
                            Text(
                              item.batchCode,
                              style: const TextStyle(
                                fontSize: AppTypography.body,
                                fontWeight: FontWeight.w700,
                                color: AppColors.neutralDark,
                              ),
                            ),
                            const SizedBox(height: 2),
                            Text(
                              '${item.originSociety} · ${item.totalWeightKg.toStringAsFixed(0)} kg',
                              style: AppTypography.bodySmallStyle,
                            ),
                          ],
                        ),
                      ),
                    ),
              const SizedBox(height: AppSpacing.lg),

              AppButton(
                label: 'Log received batch',
                icon: LucideIcons.qrCode,
                height: 40,
                onPressed: () =>
                    Navigator.pushNamed(context, AppRoutes.factoryProcessing),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _CapacityStatBox extends StatelessWidget {
  final String title;
  final String value;
  final Color color;
  final Color bgColor;

  const _CapacityStatBox({
    required this.title,
    required this.value,
    required this.color,
    required this.bgColor,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(AppSpacing.md),
      decoration: BoxDecoration(
        color: bgColor,
        borderRadius: BorderRadius.circular(12),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            title,
            style: TextStyle(
              fontSize: AppTypography.caption,
              fontWeight: FontWeight.w500,
              color: color,
            ),
          ),
          const SizedBox(height: 2),
          Text(
            value,
            style: TextStyle(
              fontSize: AppTypography.statValue,
              fontWeight: FontWeight.w800,
              color: color,
            ),
          ),
        ],
      ),
    );
  }
}
