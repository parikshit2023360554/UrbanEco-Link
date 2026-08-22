import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:provider/provider.dart';
import '../../core/constants/app_constants.dart';
import '../../core/routes/app_routes.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_spacing.dart';
import '../../core/theme/app_typography.dart';
import '../../services/auth_service.dart';
import '../../shared/widgets/app_button.dart';
import '../../shared/widgets/app_text_field.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _formKey = GlobalKey<FormState>();
  final _emailController = TextEditingController(text: 'society@urbaneco.org');
  final _passwordController = TextEditingController(text: 'password123');

  String _selectedRole = AppConstants.roleSociety;
  bool _showPassword = false;
  String? _errorMessage;

  final List<Map<String, dynamic>> _roles = [
    {
      'id': AppConstants.roleSociety,
      'label': 'Society',
      'registerLabel': 'Register Society',
      'icon': LucideIcons.building2,
      'defaultEmail': 'society@urbaneco.org',
    },
    {
      'id': AppConstants.roleNGO,
      'label': 'NGO',
      'registerLabel': 'Register NGO',
      'icon': LucideIcons.heartHandshake,
      'defaultEmail': 'ngo@urbaneco.org',
    },
    {
      'id': AppConstants.roleFactory,
      'label': 'Factory',
      'registerLabel': 'Register Factory',
      'icon': LucideIcons.factory,
      'defaultEmail': 'factory@urbaneco.org',
    },
    {
      'id': AppConstants.roleDriver,
      'label': 'Driver',
      'registerLabel': 'Register Driver',
      'icon': LucideIcons.truck,
      'defaultEmail': 'driver@urbaneco.org',
    },
  ];

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  void _selectRole(String roleId) {
    setState(() {
      _selectedRole = roleId;
      _errorMessage = null;
      final roleObj = _roles.firstWhere(
        (r) => r['id'] == roleId,
        orElse: () => _roles.first,
      );
      _emailController.text = roleObj['defaultEmail'] as String;
    });
  }

  void _handleLogin() async {
    setState(() => _errorMessage = null);
    if (!_formKey.currentState!.validate()) return;

    final auth = context.read<AuthService>();
    final success = await auth.login(
      _emailController.text.trim(),
      _passwordController.text,
      _selectedRole,
    );

    if (!mounted) return;

    if (success) {
      if (_selectedRole == AppConstants.roleDriver) {
        Navigator.pushReplacementNamed(context, AppRoutes.driverMain);
      } else if (_selectedRole == AppConstants.roleFactory) {
        Navigator.pushReplacementNamed(context, AppRoutes.factoryMain);
      } else {
        Navigator.pushReplacementNamed(context, AppRoutes.societyMain);
      }
    } else {
      setState(() => _errorMessage = 'Invalid credentials. Please try again.');
    }
  }

  Widget _buildRoleGrid() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'I am a...',
          style: TextStyle(
            fontSize: AppTypography.body,
            fontWeight: FontWeight.w600,
            color: AppColors.neutralDark,
          ),
        ),
        const SizedBox(height: AppSpacing.md),
        LayoutBuilder(
          builder: (context, constraints) {
            return GridView.builder(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: _roles.length,
              gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 2,
                crossAxisSpacing: AppSpacing.md,
                mainAxisSpacing: AppSpacing.md,
                childAspectRatio: 1.7,
              ),
              itemBuilder: (context, index) {
                final role = _roles[index];
                final isSelected = role['id'] == _selectedRole;

                return Material(
                  color: isSelected
                      ? AppColors.primaryLight
                      : AppColors.surfaceWhite,
                  borderRadius: BorderRadius.circular(16),
                  child: InkWell(
                    onTap: () => _selectRole(role['id'] as String),
                    borderRadius: BorderRadius.circular(16),
                    child: Container(
                      padding: const EdgeInsets.all(AppSpacing.md),
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(
                          color: isSelected
                              ? AppColors.primary
                              : AppColors.borderGray,
                          width: isSelected ? 2 : 1,
                        ),
                      ),
                      child: Row(
                        children: [
                          Icon(
                            role['icon'] as IconData,
                            size: 18,
                            color: isSelected
                                ? AppColors.primary
                                : AppColors.neutralGray,
                          ),
                          const SizedBox(width: AppSpacing.sm),
                          Expanded(
                            child: Text(
                              role['label'] as String,
                              style: TextStyle(
                                fontSize: AppTypography.body,
                                fontWeight: FontWeight.w700,
                                color: isSelected
                                    ? AppColors.primaryDark
                                    : AppColors.neutralDark,
                              ),
                            ),
                          ),
                          if (isSelected)
                            const Icon(
                              LucideIcons.checkCircle2,
                              size: 16,
                              color: AppColors.primary,
                            ),
                        ],
                      ),
                    ),
                  ),
                );
              },
            );
          },
        ),
      ],
    );
  }

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthService>();
    final currentRole = _roles.firstWhere(
      (r) => r['id'] == _selectedRole,
      orElse: () => _roles.first,
    );
    final registerLabel = currentRole['registerLabel'] as String;

    return Scaffold(
      backgroundColor: AppColors.bgSlate,
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(AppSpacing.screenPadding),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Brand header
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      gradient: AppColors.heroGradient,
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: const Icon(
                      LucideIcons.leaf,
                      size: 18,
                      color: Colors.white,
                    ),
                  ),
                  const SizedBox(width: AppSpacing.md),
                  const Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'UrbanEco Link',
                          style: TextStyle(
                            fontSize: AppTypography.loginTitle,
                            fontWeight: FontWeight.w800,
                            color: AppColors.neutralDark,
                          ),
                        ),
                        Text(
                          'Smart waste management portal',
                          style: AppTypography.bodySmallStyle,
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: AppSpacing.xl),

              const Text(
                'Sign in',
                style: TextStyle(
                  fontSize: AppTypography.loginTitle,
                  fontWeight: FontWeight.w800,
                  color: AppColors.neutralDark,
                  letterSpacing: -0.3,
                ),
              ),
              const SizedBox(height: AppSpacing.xs),
              const Text(
                'Choose your role and enter your credentials.',
                style: AppTypography.loginSubtitleStyle,
              ),
              const SizedBox(height: AppSpacing.xl),

              _buildRoleGrid(),
              const SizedBox(height: AppSpacing.xl),

              Form(
                key: _formKey,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    if (_errorMessage != null) ...[
                      Container(
                        width: double.infinity,
                        padding: const EdgeInsets.all(AppSpacing.md),
                        decoration: BoxDecoration(
                          color: AppColors.dangerBg,
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: AppColors.dangerBorder),
                        ),
                        child: Row(
                          children: [
                            const Icon(
                              LucideIcons.alertCircle,
                              color: AppColors.dangerText,
                              size: 18,
                            ),
                            const SizedBox(width: AppSpacing.sm),
                            Expanded(
                              child: Text(
                                _errorMessage!,
                                style: const TextStyle(
                                  fontSize: AppTypography.bodySmall,
                                  color: AppColors.dangerText,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: AppSpacing.lg),
                    ],

                    AppTextField(
                      label: 'Email',
                      hint: 'you@example.com',
                      controller: _emailController,
                      keyboardType: TextInputType.emailAddress,
                      prefixIcon: LucideIcons.mail,
                      validator: (val) {
                        if (val == null || val.trim().isEmpty) {
                          return 'Email is required';
                        }
                        if (!val.contains('@')) return 'Enter a valid email';
                        return null;
                      },
                    ),
                    const SizedBox(height: AppSpacing.lg),

                    AppTextField(
                      label: 'Password',
                      hint: 'Enter your password',
                      controller: _passwordController,
                      obscureText: !_showPassword,
                      prefixIcon: LucideIcons.lock,
                      suffixIcon: IconButton(
                        icon: Icon(
                          _showPassword
                              ? LucideIcons.eyeOff
                              : LucideIcons.eye,
                          size: 18,
                          color: AppColors.neutralGray,
                        ),
                        onPressed: () =>
                            setState(() => _showPassword = !_showPassword),
                      ),
                      validator: (val) {
                        if (val == null || val.isEmpty) {
                          return 'Password is required';
                        }
                        if (val.length < 6) {
                          return 'At least 6 characters required';
                        }
                        return null;
                      },
                    ),
                    const SizedBox(height: AppSpacing.sm),

                    Align(
                      alignment: Alignment.centerRight,
                      child: TextButton(
                        onPressed: () => Navigator.pushNamed(
                          context,
                          AppRoutes.forgotPassword,
                        ),
                        child: const Text(
                          'Forgot password?',
                          style: TextStyle(
                            fontSize: AppTypography.bodySmall,
                            fontWeight: FontWeight.w600,
                            color: AppColors.primary,
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(height: AppSpacing.lg),

                    AppButton(
                      label: 'Sign in',
                      icon: LucideIcons.logIn,
                      onPressed: _handleLogin,
                      isLoading: auth.isLoading,
                    ),
                    const SizedBox(height: AppSpacing.lg),

                    Center(
                      child: Wrap(
                        alignment: WrapAlignment.center,
                        crossAxisAlignment: WrapCrossAlignment.center,
                        children: [
                          const Text(
                            "Don't have an account? ",
                            style: AppTypography.bodySmallStyle,
                          ),
                          GestureDetector(
                            onTap: () => Navigator.pushNamed(
                              context,
                              AppRoutes.register,
                            ),
                            child: Text(
                              registerLabel,
                              style: const TextStyle(
                                fontSize: AppTypography.bodySmall,
                                fontWeight: FontWeight.w700,
                                color: AppColors.primary,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
