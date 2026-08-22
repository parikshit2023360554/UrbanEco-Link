import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../../core/constants/app_constants.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_typography.dart';

class RoleBottomNavBar extends StatelessWidget {
  final String role;
  final int currentIndex;
  final ValueChanged<int> onTap;

  const RoleBottomNavBar({
    super.key,
    required this.role,
    required this.currentIndex,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final items = _getNavItemsForRole(role);
    final safeIndex = currentIndex < items.length ? currentIndex : 0;

    return Container(
      decoration: const BoxDecoration(
        color: Colors.white,
        border: Border(top: BorderSide(color: AppColors.borderLight)),
        boxShadow: [
          BoxShadow(
            color: Color(0x08000000),
            blurRadius: 16,
            offset: Offset(0, -4),
          ),
        ],
      ),
      child: SafeArea(
        top: false,
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 6),
          child: Row(
            children: List.generate(items.length, (index) {
              final item = items[index];
              final isSelected = index == safeIndex;

              return Expanded(
                child: _NavItem(
                  icon: item.icon,
                  label: item.label,
                  isSelected: isSelected,
                  onTap: () => onTap(index),
                ),
              );
            }),
          ),
        ),
      ),
    );
  }

  List<_NavItemData> _getNavItemsForRole(String role) {
    if (role == AppConstants.roleDriver) {
      return const [
        _NavItemData(LucideIcons.home, 'Today'),
        _NavItemData(LucideIcons.truck, 'Jobs'),
        _NavItemData(LucideIcons.qrCode, 'Scan'),
        _NavItemData(LucideIcons.history, 'History'),
        _NavItemData(LucideIcons.user, 'Profile'),
      ];
    } else if (role == AppConstants.roleFactory) {
      return const [
        _NavItemData(LucideIcons.factory, 'Overview'),
        _NavItemData(LucideIcons.truck, 'Incoming'),
        _NavItemData(LucideIcons.layers, 'Process'),
        _NavItemData(LucideIcons.gauge, 'Capacity'),
        _NavItemData(LucideIcons.settings, 'Settings'),
      ];
    } else {
      return const [
        _NavItemData(LucideIcons.home, 'Home'),
        _NavItemData(LucideIcons.sparkles, 'Forecast'),
        _NavItemData(LucideIcons.truck, 'Pickups'),
        _NavItemData(LucideIcons.award, 'Rewards'),
        _NavItemData(LucideIcons.user, 'Profile'),
      ];
    }
  }
}

class _NavItemData {
  final IconData icon;
  final String label;

  const _NavItemData(this.icon, this.label);
}

class _NavItem extends StatelessWidget {
  final IconData icon;
  final String label;
  final bool isSelected;
  final VoidCallback onTap;

  const _NavItem({
    required this.icon,
    required this.label,
    required this.isSelected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(14),
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 200),
          padding: const EdgeInsets.symmetric(vertical: 8),
          decoration: BoxDecoration(
            color: isSelected
                ? AppColors.primaryLight.withValues(alpha: 0.7)
                : Colors.transparent,
            borderRadius: BorderRadius.circular(14),
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(
                icon,
                size: 20,
                color: isSelected ? AppColors.primary : AppColors.neutralGray,
              ),
              const SizedBox(height: 3),
              Text(
                label,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: TextStyle(
                  fontSize: AppTypography.navLabel,
                  fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
                  color: isSelected ? AppColors.primary : AppColors.neutralGray,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
