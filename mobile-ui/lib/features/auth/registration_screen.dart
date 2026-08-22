import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:provider/provider.dart';
import '../../core/constants/app_constants.dart';
import '../../core/routes/app_routes.dart';
import '../../core/theme/app_colors.dart';
import '../../services/auth_service.dart';
import '../../shared/widgets/app_button.dart';
import '../../shared/widgets/app_card.dart';
import '../../shared/widgets/app_text_field.dart';

class RegistrationScreen extends StatefulWidget {
  const RegistrationScreen({super.key});

  @override
  State<RegistrationScreen> createState() => _RegistrationScreenState();
}

class _RegistrationScreenState extends State<RegistrationScreen> {
  final _formKey = GlobalKey<FormState>();
  final _nameController = TextEditingController();
  final _emailController = TextEditingController();
  final _phoneController = TextEditingController();
  final _addressController = TextEditingController();
  final _passwordController = TextEditingController();

  String _selectedRole = AppConstants.roleSociety;

  @override
  void dispose() {
    _nameController.dispose();
    _emailController.dispose();
    _phoneController.dispose();
    _addressController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  void _handleRegister() async {
    if (!_formKey.currentState!.validate()) return;

    final auth = context.read<AuthService>();
    final success = await auth.register(
      name: _nameController.text.trim(),
      email: _emailController.text.trim(),
      password: _passwordController.text,
      role: _selectedRole,
      phone: _phoneController.text.trim(),
      address: _addressController.text.trim(),
    );

    if (!mounted) return;

    if (success) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Registration successful! Welcome to UrbanEco-Link.'),
          backgroundColor: AppColors.primary,
        ),
      );
      Navigator.pushReplacementNamed(context, AppRoutes.societyMain);
    }
  }

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthService>();

    return Scaffold(
      backgroundColor: AppColors.bgSlate,
      appBar: AppBar(
        title: const Text('Register Society / Generator'),
        leading: IconButton(
          icon: const Icon(LucideIcons.arrowLeft),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(20.0),
          child: AppCard(
            child: Form(
              key: _formKey,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Join UrbanEco-Link Network',
                    style: TextStyle(
                      fontSize: 20,
                      fontWeight: FontWeight.w800,
                      color: AppColors.neutralDark,
                    ),
                  ),
                  const SizedBox(height: 4),
                  const Text(
                    'Streamline bulk waste segregation & municipal compliance under SWM 2026',
                    style: TextStyle(fontSize: 13, color: AppColors.neutralGray),
                  ),
                  const SizedBox(height: 20),

                  AppTextField(
                    label: 'Organization / Society Name',
                    hint: 'e.g. Greenwood Heights RWA',
                    controller: _nameController,
                    prefixIcon: LucideIcons.building2,
                    validator: (v) => v == null || v.trim().isEmpty ? 'Name is required' : null,
                  ),
                  const SizedBox(height: 14),

                  AppTextField(
                    label: 'Official Email Address',
                    hint: 'rwa@society.com',
                    controller: _emailController,
                    keyboardType: TextInputType.emailAddress,
                    prefixIcon: LucideIcons.mail,
                    validator: (v) => v == null || !v.contains('@') ? 'Valid email required' : null,
                  ),
                  const SizedBox(height: 14),

                  AppTextField(
                    label: 'Contact Phone Number',
                    hint: '+91 98765 43210',
                    controller: _phoneController,
                    keyboardType: TextInputType.phone,
                    prefixIcon: LucideIcons.phone,
                    validator: (v) => v == null || v.trim().length < 10 ? 'Valid phone required' : null,
                  ),
                  const SizedBox(height: 14),

                  AppTextField(
                    label: 'Collection Address & Sector',
                    hint: 'Gate 2, Sector 62, Eco City',
                    controller: _addressController,
                    prefixIcon: LucideIcons.mapPin,
                    maxLines: 2,
                    validator: (v) => v == null || v.trim().isEmpty ? 'Address is required' : null,
                  ),
                  const SizedBox(height: 14),

                  AppTextField(
                    label: 'Password',
                    hint: '••••••••',
                    controller: _passwordController,
                    obscureText: true,
                    prefixIcon: LucideIcons.lock,
                    validator: (v) => v == null || v.length < 6 ? 'At least 6 characters' : null,
                  ),
                  const SizedBox(height: 24),

                  AppButton(
                    label: 'Complete Registration',
                    onPressed: _handleRegister,
                    isLoading: auth.isLoading,
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
