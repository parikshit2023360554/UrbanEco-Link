import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:provider/provider.dart';
import '../../core/theme/app_colors.dart';
import '../../services/society_service.dart';
import '../../shared/widgets/app_button.dart';
import '../../shared/widgets/app_card.dart';

class RewardsScreen extends StatelessWidget {
  const RewardsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final societyService = context.watch<SocietyService>();
    final rewards = societyService.rewards;
    final points = societyService.rewardPointsBalance;

    return Scaffold(
      backgroundColor: AppColors.bgSlate,
      appBar: AppBar(
        title: const Text('UrbanEco Rewards & Credits'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.only(left: 16.0, right: 16.0, top: 14.0, bottom: 80.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Points Balance Card
            Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                gradient: AppColors.heroGradient,
                borderRadius: BorderRadius.circular(14),
                boxShadow: [
                  BoxShadow(
                    color: AppColors.primary.withValues(alpha: 0.15),
                    blurRadius: 10,
                    offset: const Offset(0, 3),
                  ),
                ],
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: const [
                      Text(
                        'AVAILABLE ECO-CREDITS',
                        style: TextStyle(fontSize: 10, fontWeight: FontWeight.w600, color: Colors.white70, letterSpacing: 0.5),
                      ),
                      Icon(LucideIcons.sparkles, color: Colors.white, size: 18),
                    ],
                  ),
                  const SizedBox(height: 4),
                  Text(
                    '$points PTS',
                    style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w700, color: Colors.white, letterSpacing: -0.2),
                  ),
                  const SizedBox(height: 2),
                  const Text(
                    'Earned via 95%+ segregation compliance & prompt pickup confirmation',
                    style: TextStyle(fontSize: 10, color: Colors.white70),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),

            const Text(
              'Redeem Civic Rewards & Incentives',
              style: TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: AppColors.neutralDark),
            ),
            const SizedBox(height: 2),
            const Text(
              'Official municipal tax credits, compost supplies & eco-certificates',
              style: TextStyle(fontSize: 11, color: AppColors.neutralGray),
            ),
            const SizedBox(height: 12),

            ListView.builder(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: rewards.length,
              itemBuilder: (context, index) {
                final item = rewards[index];
                final canRedeem = points >= item.pointsRequired && !item.isRedeemed;

                return AppCard(
                  margin: const EdgeInsets.only(bottom: 10),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
                            decoration: BoxDecoration(
                              color: AppColors.primaryLight,
                              borderRadius: BorderRadius.circular(10),
                            ),
                            child: Text(
                              '${item.pointsRequired} PTS',
                              style: const TextStyle(fontSize: 10, fontWeight: FontWeight.w700, color: AppColors.primaryDark),
                            ),
                          ),
                          if (item.isRedeemed)
                            const Text('Redeemed', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w600, color: AppColors.successText)),
                        ],
                      ),
                      const SizedBox(height: 8),
                      Text(
                        item.title,
                        style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: AppColors.neutralDark),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        item.description,
                        style: const TextStyle(fontSize: 11, color: AppColors.neutralGray),
                      ),
                      const SizedBox(height: 10),
                      AppButton(
                        label: item.isRedeemed ? 'Already Claimed' : 'Redeem Voucher',
                        icon: item.isRedeemed ? LucideIcons.checkCircle : LucideIcons.gift,
                        type: canRedeem ? AppButtonType.primary : AppButtonType.outline,
                        height: 36,
                        onPressed: canRedeem
                            ? () {
                                societyService.redeemReward(item.id);
                                ScaffoldMessenger.of(context).showSnackBar(
                                  SnackBar(content: Text('Voucher "${item.title}" claimed!'), backgroundColor: AppColors.primary),
                                );
                              }
                            : null,
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
}
