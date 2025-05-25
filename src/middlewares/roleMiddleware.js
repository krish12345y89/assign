const authorizeRoles = (...roles) => {
  console.log(roles)
  console.log('authorizeRoles middleware initialized with roles:', roles);
  return (req, res, next) => {
    console.log('User role:', req.user.role);
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden: Role not allowed' });
    }
    next();
  };
};

export default authorizeRoles;
