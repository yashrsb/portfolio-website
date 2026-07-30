const notFound = (req, res) => {
  res.status(404).json({
    status: 'error',
    statusCode: 404,
    message: `Route ${req.originalUrl} not found`,
  });
};

export default notFound;
