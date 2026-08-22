import 'package:flutter/foundation.dart';
import '../core/constants/app_constants.dart';
import '../shared/models/models.dart';

class AuthService extends ChangeNotifier {
  UserModel? _currentUser;
  String _activeRole = AppConstants.roleSociety;
  bool _isLoading = false;

  UserModel? get currentUser => _currentUser;
  String get activeRole => _activeRole;
  bool get isLoading => _isLoading;
  bool get isAuthenticated => _currentUser != null;

  AuthService() {
    // Default mock initial user
    _currentUser = UserModel(
      id: 'USER-101',
      name: 'Greenwood Heights RWA',
      email: 'society@urbaneco.org',
      role: AppConstants.roleSociety,
      phone: '+91 98765 43210',
      organizationName: 'Greenwood Society RWA',
      address: 'Block B, Sector 62, Urban Eco-Zone',
    );
  }

  void setRole(String role) {
    _activeRole = role;
    if (_currentUser != null) {
      String name = 'Greenwood Heights RWA';
      if (role == AppConstants.roleDriver) {
        name = 'Vikram Singh (Logistics Lead)';
      } else if (role == AppConstants.roleFactory) {
        name = 'EcoMatrix Bio-Recycling Facility';
      } else if (role == AppConstants.roleNGO) {
        name = 'CleanCity Civic Foundation';
      }
      _currentUser = UserModel(
        id: _currentUser!.id,
        name: name,
        email: _currentUser!.email,
        role: role,
        phone: _currentUser!.phone,
        organizationName: name,
        address: _currentUser!.address,
      );
    }
    notifyListeners();
  }

  Future<bool> login(String email, String password, String role) async {
    _isLoading = true;
    notifyListeners();

    await Future.delayed(const Duration(milliseconds: 600));

    _activeRole = role;
    _currentUser = UserModel(
      id: 'USER-${DateTime.now().millisecondsSinceEpoch.toString().substring(8)}',
      name: role == AppConstants.roleDriver
          ? 'Rajesh Kumar (Driver)'
          : role == AppConstants.roleFactory
              ? 'EcoMatrix Recycling Facility #4'
              : role == AppConstants.roleNGO
                  ? 'Swachh Bharat Volunteer Org'
                  : 'Greenwood Heights RWA',
      email: email,
      role: role,
      phone: '+91 98765 43210',
      organizationName: 'UrbanEco Enterprise',
      address: 'Sector 62, Eco City',
    );

    _isLoading = false;
    notifyListeners();
    return true;
  }

  Future<bool> register({
    required String name,
    required String email,
    required String password,
    required String role,
    required String phone,
    String? address,
  }) async {
    _isLoading = true;
    notifyListeners();

    await Future.delayed(const Duration(milliseconds: 700));

    _activeRole = role;
    _currentUser = UserModel(
      id: 'USER-REG-${DateTime.now().millisecondsSinceEpoch}',
      name: name,
      email: email,
      role: role,
      phone: phone,
      organizationName: name,
      address: address ?? 'Eco-Zone Sector 12',
    );

    _isLoading = false;
    notifyListeners();
    return true;
  }

  void logout() {
    _currentUser = null;
    _activeRole = AppConstants.roleSociety;
    notifyListeners();
  }
}
