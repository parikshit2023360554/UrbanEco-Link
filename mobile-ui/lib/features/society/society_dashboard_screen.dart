import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:provider/provider.dart';
import '../../core/constants/app_constants.dart';
import '../../core/routes/app_routes.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_spacing.dart';
import '../../core/theme/app_typography.dart';
import '../../services/auth_service.dart';
import '../../services/society_service.dart';
import '../../shared/models/models.dart';
import '../../shared/widgets/app_button.dart';
import '../../shared/widgets/app_card.dart';
import '../../shared/widgets/screen_layout.dart';
import '../../shared/widgets/status_badge.dart';
import 'forecast_confirmation_screen.dart';

class SocietyDashboardScreen extends StatelessWidget {
  const SocietyDashboardScreen({super.key});

  String _greeting() {
    final hour = DateTime.now().hour;
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  }

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthService>();
    final societyService = context.watch<SocietyService>();
    final user = auth.currentUser;
    final forecasts = societyService.forecasts
        .where((f) => !f.isConfirmed && !f.isCancelled)
        .toList();
    final pickups = societyService.pickups;
    final trustGrade = societyService.trustGrade;

    final activePickups = pickups
        .where((p) => p.status != AppConstants.pickupCompleted)
        .toList();

    return Scaffold(
      backgroundColor: AppColors.bgSlate,
      body: SafeArea(
        child: RefreshIndicator(
          onRefresh: () async {
            await Future.delayed(const Duration(milliseconds: 500));
          },
          color: AppColors.primary,
          child: SingleChildScrollView(
            physics: const AlwaysScrollableScrollPhysics(
              parent: BouncingScrollPhysics(),
            ),
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
                  title: '${_greeting()},\n${user?.name ?? 'Greenwood Heights'}',
                  subtitle: 'Manage your society waste pickups',
                  onNotificationTap: () =>
                      Navigator.pushNamed(context, AppRoutes.notifications),
                ),
                const SizedBox(height: AppSpacing.xl),

                GridView.count(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  crossAxisCount: 3,
                  mainAxisSpacing: AppSpacing.sm,
                  crossAxisSpacing: AppSpacing.sm,
                  childAspectRatio: AppSpacing.quickActionAspectRatio,
                  children: [
                    QuickActionTile(
                      icon: LucideIcons.plus,
                      label: 'Request Pickup',
                      onTap: () => Navigator.pushNamed(
                        context,
                        AppRoutes.societyRequestPickup,
                      ),
                    ),
                    QuickActionTile(
                      icon: LucideIcons.history,
                      label: 'Pickup History',
                      onTap: () => Navigator.pushNamed(
                        context,
                        AppRoutes.societyPickupHistory,
                      ),
                    ),
                    QuickActionTile(
                      icon: LucideIcons.award,
                      label: 'Rewards',
                      onTap: () => Navigator.pushNamed(
                        context,
                        AppRoutes.societyRewards,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: AppSpacing.xl),

                HighlightBanner(
                  icon: LucideIcons.shieldCheck,
                  title: 'Trust Score ${trustGrade.score}/100',
                  subtitle:
                      '${trustGrade.segregationAccuracyPercent}% segregation accuracy',
                  badge: 'Top 5%',
                  onTap: () => Navigator.pushNamed(
                    context,
                    AppRoutes.societyTrustGrade,
                  ),
                ),
                const SizedBox(height: AppSpacing.xl),

                if (activePickups.isNotEmpty) ...[
                  const SectionHeader(title: 'Active pickups'),
                  const SizedBox(height: AppSpacing.sm),
                  ...activePickups.map((item) => _ActivePickupCard(item: item)),
                  const SizedBox(height: AppSpacing.lg),
                ],

                SectionHeader(
                  title: 'Recent pickups',
                  actionLabel: 'See all',
                  onAction: () => Navigator.pushNamed(
                    context,
                    AppRoutes.societyPickupHistory,
                  ),
                ),
                const SizedBox(height: AppSpacing.sm),

                if (pickups.isEmpty)
                  const AppCard(
                    hasShadow: false,
                    padding: EdgeInsets.symmetric(vertical: 18, horizontal: 12),
                    child: Center(
                      child: Text(
                        'No pickups yet. Tap "Request Pickup" to get started.',
                        textAlign: TextAlign.center,
                        style: AppTypography.bodySmallStyle,
                      ),
                    ),
                  )
                else
                  ...pickups.take(3).map(
                        (item) => ListItemCard(
                          icon: LucideIcons.truck,
                          title:
                              '${item.streamCategory} · ${item.weightKg.toStringAsFixed(0)} kg',
                          subtitle: item.timeSlot,
                          trailing: StatusBadge.pickupStatus(item.status),
                        ),
                      ),

                if (forecasts.isNotEmpty) ...[
                  const SizedBox(height: AppSpacing.xl),
                  const SectionHeader(title: 'Upcoming forecast'),
                  const SizedBox(height: AppSpacing.sm),
                  ...forecasts.map(
                    (forecast) => _ForecastCard(
                      forecast: forecast,
                      onConfirm: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (_) => ForecastConfirmationScreen(
                              forecast: forecast,
                            ),
                          ),
                        );
                      },
                    ),
                  ),
                ],
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _ActivePickupCard extends StatelessWidget {
  final PickupRequestModel item;

  const _ActivePickupCard({required this.item});

  @override
  Widget build(BuildContext context) {
    return AppCard(
      margin: const EdgeInsets.only(bottom: AppSpacing.sm),
      padding: const EdgeInsets.all(AppSpacing.lg),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              StatusBadge.streamCategory(item.streamCategory),
              const Spacer(),
              StatusBadge.pickupStatus(item.status),
            ],
          ),
          const SizedBox(height: AppSpacing.md),
          Text(
            '${item.weightKg.toStringAsFixed(0)} kg',
            style: const TextStyle(
              fontSize: AppTypography.statValue,
              fontWeight: FontWeight.w800,
              color: AppColors.neutralDark,
            ),
          ),
          const SizedBox(height: 2),
          Text(
            item.assignedDriverName ?? 'Assigning driver...',
            style: const TextStyle(
              fontSize: AppTypography.bodySmall,
              color: AppColors.primary,
              fontWeight: FontWeight.w600,
            ),
          ),
        ],
      ),
    );
  }
}

class _ForecastCard extends StatelessWidget {
  final WasteForecastModel forecast;
  final VoidCallback onConfirm;

  const _ForecastCard({
    required this.forecast,
    required this.onConfirm,
  });

  @override
  Widget build(BuildContext context) {
    return AppCard(
      margin: const EdgeInsets.only(bottom: AppSpacing.sm),
      padding: const EdgeInsets.all(AppSpacing.lg),
      borderColor: AppColors.primary.withValues(alpha: 0.2),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              StatusBadge.streamCategory(forecast.streamCategory),
              const Spacer(),
              Text(
                '${forecast.confidencePercentage}% match',
                style: const TextStyle(
                  fontSize: AppTypography.bodySmall,
                  fontWeight: FontWeight.w600,
                  color: AppColors.primary,
                ),
              ),
            ],
          ),
          const SizedBox(height: AppSpacing.md),
          Row(
            children: [
              Expanded(
                child: _InfoBlock(
                  label: 'Expected waste',
                  value: '${forecast.predictedWeightKg.toStringAsFixed(0)} kg',
                ),
              ),
              Expanded(
                child: _InfoBlock(
                  label: 'Time slot',
                  value: forecast.predictedTimeSlot,
                  alignEnd: true,
                ),
              ),
            ],
          ),
          const SizedBox(height: AppSpacing.md),
          AppButton(
            label: 'Confirm pickup',
            icon: LucideIcons.check,
            height: 40,
            onPressed: onConfirm,
          ),
        ],
      ),
    );
  }
}

class _InfoBlock extends StatelessWidget {
  final String label;
  final String value;
  final bool alignEnd;

  const _InfoBlock({
    required this.label,
    required this.value,
    this.alignEnd = false,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment:
          alignEnd ? CrossAxisAlignment.end : CrossAxisAlignment.start,
      children: [
        Text(label, style: AppTypography.bodySmallStyle),
        const SizedBox(height: 2),
        Text(
          value,
          maxLines: 1,
          overflow: TextOverflow.ellipsis,
          style: const TextStyle(
            fontSize: AppTypography.body,
            fontWeight: FontWeight.w700,
            color: AppColors.neutralDark,
          ),
        ),
      ],
    );
  }
}
